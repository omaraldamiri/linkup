package com.softwareproject.LinkUp.services;


import com.softwareproject.LinkUp.dtos.AuthResponse;
import com.softwareproject.LinkUp.dtos.LoginDTO;
import com.softwareproject.LinkUp.dtos.RegisterDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.exceptions.EmailAlreadyExistsException;
import com.softwareproject.LinkUp.repos.UserRepository;
import com.softwareproject.LinkUp.sec.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
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
        String token=jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse authUser(LoginDTO loginDTO){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword()));
                User user=userRepository.findByEmail(loginDTO.getEmail()).orElseThrow(()->new RuntimeException("User Not Found"));
                return new AuthResponse(jwtService.generateToken(user));
    }


}
