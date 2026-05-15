package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.repos.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminBootstrapService implements ApplicationRunner {

    private final UserRepository userRepository;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    public void promoteIfAdminEmail(User user) {
        if (adminEmail == null || adminEmail.isBlank()) {
            return;
        }
        if (!adminEmail.equalsIgnoreCase(user.getEmail())) {
            return;
        }
        if (!Boolean.TRUE.equals(user.getSystemAdmin())) {
            user.setSystemAdmin(true);
            userRepository.save(user);
        }
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank()) {
            return;
        }
        userRepository.findByEmail(adminEmail).ifPresent(this::promoteIfAdminEmail);
    }
}
