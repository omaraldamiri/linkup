package com.softwareproject.LinkUp.sec;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**","/swagger-ui/**", "/v3/api-docs/**","/oauth2/**", "/login/**","/login/oauth2/**").permitAll() // public endpoints like login/register
                        .anyRequest().authenticated()           // everything else needs auth
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // JWT is stateless
                ).oauth2Login(oauth -> oauth.successHandler(oAuth2SuccessHandler))
                .exceptionHandling(ex->
                        ex.authenticationEntryPoint(
                                (request, response, authException) -> {
                                    response.setStatus(401);
                                    response.getWriter().write("Unauthorized for this endpoint");
                                }
                        ))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

}