package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.AuthResponse;
import com.softwareproject.LinkUp.dtos.LoginDTO;
import com.softwareproject.LinkUp.dtos.RegisterDTO;
import com.softwareproject.LinkUp.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody RegisterDTO registerDTO){
        return  ResponseEntity.status(201).body(authService.registerUser(registerDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginDTO loginDTO){
        return ResponseEntity.ok(authService.authUser(loginDTO));
    }

}
