package com.softwareproject.LinkUp.sec;

import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.repos.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = Optional.ofNullable(oAuth2User.getAttribute("email"))
                .map(Object::toString)  // cast Object -> String
                .orElseThrow(() -> new IllegalArgumentException("Email not found from OAuth2 provider"));
        String name  = oAuth2User.getAttribute("name");
        String image = oAuth2User.getAttribute("picture");
        String googleId=oAuth2User.getAttribute("sub");
        // find user or create new one
        User user = userRepository.findByGoogleId(googleId).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .image(image)
                    .oAuth2User(true)
                    .password(null)
                    .googleId(googleId)
                    .build();
            return userRepository.save(newUser);
        });

        String token = jwtService.generateToken(new HashMap<>(), user);

//        response.sendRedirect("http://localhost:3000/oauth2/callback?token=" + token);
        response.setContentType("application/json");
        response.getWriter().write("{\"token\":\"" + token + "\"}");
    }
}