package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.dtos.UpdatedUserDTO;
import com.softwareproject.LinkUp.dtos.UserDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.exceptions.EmailAlreadyExistsException;
import com.softwareproject.LinkUp.repos.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public UserDTO showUserData(User user){
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .image(user.getImage())
                .createdAt(user.getCreatedAt()).build();
    }

    public void updateUser(UpdatedUserDTO updatedUserDTO,User user){
            
        // only check if user is trying to update an existed other user email not his own
            if(updatedUserDTO.getEmail() != null) {
                userRepository.findByEmail(updatedUserDTO.getEmail()).ifPresent(existing -> {
                    if (!existing.getId().equals(user.getId()))
                        throw new EmailAlreadyExistsException("Email trying to update already exists");
                });
            }


            if(updatedUserDTO.getEmail()!=null) user.setEmail(updatedUserDTO.getEmail());
            if(updatedUserDTO.getName()!=null) user.setName(updatedUserDTO.getName());
            if(updatedUserDTO.getImage()!=null)user.setImage(updatedUserDTO.getImage());
            if(updatedUserDTO.getPassword()!=null)user.setPassword(passwordEncoder.encode(updatedUserDTO.getPassword()));
            userRepository.save(user);
    }


    public void deleteUser(User user) {
        userRepository.delete(user);
    }
}