package com.softwareproject.LinkUp.sec;

import com.softwareproject.LinkUp.dtos.AuthResponse;
import com.softwareproject.LinkUp.dtos.UserDTO;
import com.softwareproject.LinkUp.dtos.WorkspaceDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.repos.UserRepository;
import com.softwareproject.LinkUp.repos.WorkspaceRepository;
import com.softwareproject.LinkUp.services.WorkspaceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
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

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = Optional.ofNullable(oAuth2User.getAttribute("email"))
                .map(Object::toString)
                .orElseThrow(() -> new IllegalArgumentException("Email not found from OAuth2 provider"));
        String name  = oAuth2User.getAttribute("name");
        String image = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getAttribute("sub");

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

        // Strip image fields before URL-encoding: base64 data URLs can be hundreds of KB.
        // Embedding them in a Location header exceeds nginx's large_client_header_buffers
        // limit (default 4×8KB), causing HTTP 500 on the redirect.
        // The frontend fetches full user data via GET /users/me after the OAuth callback.
        List<WorkspaceDTO> workspaceDTOList = workspaceService.getWorkspacesDTO(
                workspaceRepository.findByUser(user))
                .stream()
                .map(w -> WorkspaceDTO.builder()
                        .id(w.getId())
                        .name(w.getName())
                        .slug(w.getSlug())
                        .description(w.getDescription())
                        .imageUrl(null)  // stripped — fetched lazily after login
                        .build())
                .collect(java.util.stream.Collectors.toList());

        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .image(null)  // stripped — re-fetched via GET /users/me after callback
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .userDTO(userDTO)
                .workspaceDTOList(workspaceDTOList)
                .token(jwtService.generateToken(Map.of(), user))
                .build();

        String json = objectMapper.writeValueAsString(authResponse);
        String encoded = Base64.getUrlEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
        String redirectUrl = frontendUrl + "/oauth2/callback?data=" + encoded;
        response.sendRedirect(redirectUrl);
    }
}