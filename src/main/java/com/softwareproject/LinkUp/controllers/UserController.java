package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.UpdatedUserDTO;
import com.softwareproject.LinkUp.dtos.UserDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.services.UserService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    @GetMapping("/me")
    public ResponseEntity<UserDTO> returnLoggedUser(){
        User user =(User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(userService.showUserData(user));
    }
    @PatchMapping("/me")
    public ResponseEntity<String> updateUserDetails(@RequestBody UpdatedUserDTO updatedUserDTO){
        User user=(User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        userService.updateUser(updatedUserDTO,user);
        return ResponseEntity.ok("User Updated Successfully");
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteUser(){
        User user=(User )SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        userService.deleteUser(user);
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("User Deleted Succsefully!");

    }
}
