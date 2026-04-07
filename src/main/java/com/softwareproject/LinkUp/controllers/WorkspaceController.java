package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.AddingMemberDTO;
import com.softwareproject.LinkUp.dtos.RemovingMemberDTO;
import com.softwareproject.LinkUp.dtos.WorkspaceDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.services.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workspaces")
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @PostMapping("/create")
    public ResponseEntity<String> createWorkspace(@RequestBody WorkspaceDTO workspaceDTO){
        User user= (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        workspaceService.createWorkSpace(user,workspaceDTO);
        return ResponseEntity.ok("Workspace created Successfully");

    }
    @PostMapping("/adduser")
    public ResponseEntity<String> inviteMember(@RequestBody AddingMemberDTO addingMemberDTO){
        workspaceService.inviteMember(addingMemberDTO,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        return ResponseEntity.ok("User with the email : " + addingMemberDTO.getUserEmail() + " added succsefully!");
    }

        @DeleteMapping("/removeuser")
        public ResponseEntity<String> removeMember(@RequestBody RemovingMemberDTO removingMemberDTO){
            workspaceService.removeMember(removingMemberDTO,
                            (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
            return ResponseEntity.ok("User removed successfully!");
        }

}
