package com.softwareproject.LinkUp.sec;

import com.softwareproject.LinkUp.dtos.AuthResponse;
import com.softwareproject.LinkUp.dtos.UserDTO;
import com.softwareproject.LinkUp.dtos.WorkspaceDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.repos.UserRepository;
import com.softwareproject.LinkUp.repos.WorkspaceRepository;
import com.softwareproject.LinkUp.services.WorkspaceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final WorkspaceService workspaceService;
    private final WorkspaceRepository workspaceRepository;
    private final ObjectMapper objectMapper;
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



        List<WorkspaceDTO> workspaceDTOList=workspaceService.getWorkspacesDTO(workspaceRepository.findByUser(user));
        UserDTO userDTO=UserDTO.builder()
                .id(user.getId())
                .image(user.getImage())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();

        AuthResponse authResponse=AuthResponse.builder().userDTO(userDTO)
                .workspaceDTOList(workspaceDTOList).token(jwtService.generateToken(Map.of(), user))
                .build();


        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(authResponse));    }
}