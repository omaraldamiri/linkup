package com.softwareproject.LinkUp.services;


import com.softwareproject.LinkUp.dtos.*;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.entities.WorkspaceMember;
import com.softwareproject.LinkUp.exceptions.EmailAlreadyExistsException;
import com.softwareproject.LinkUp.repos.UserRepository;
import com.softwareproject.LinkUp.repos.WorkspaceRepository;
import com.softwareproject.LinkUp.sec.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceService workspaceService;
    public AuthResponse registerUser(RegisterDTO registerDTO){
        if(userRepository.findByEmail(registerDTO.getEmail()).isPresent()){
            throw new EmailAlreadyExistsException("Email already exists! Try another one");
        }



        User user= User.builder().name(registerDTO.getName())
                .email(registerDTO.getEmail())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .image(registerDTO.getImageUrl())
                .oAuth2User(false).googleId(null).build();
        userRepository.save(user);

        UserDTO userDTO=UserDTO.builder()
                .id(user.getId())
                .image(user.getImage())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();


        return new AuthResponse(jwtService.generateToken(user),userDTO,new ArrayList<>());
    }

    public AuthResponse authUser(LoginDTO loginDTO){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword()));
                User user=userRepository.findByEmail(loginDTO.getEmail()).orElseThrow(()->new RuntimeException("User Not Found"));

                List<Workspace> workspaceList=workspaceRepository.findByUser(user).orElseThrow(
                        ()->new RuntimeException("Error happened")
                );

                List<WorkspaceDTO> workspaceDTOList=workspaceService.getWorkspacesDTO(workspaceList);

                UserDTO userDTO=UserDTO.builder()
                .id(user.getId())
                .image(user.getImage())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();




                return new AuthResponse(jwtService.generateToken(user),userDTO,workspaceDTOList);
    }


}
