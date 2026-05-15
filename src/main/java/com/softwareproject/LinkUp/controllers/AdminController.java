package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.*;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<PagedResponseDTO<AdminUserRowDTO>> listUsers(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.listUsers(q, page, size));
    }

    @PatchMapping("/users/{userId}/enabled")
    public ResponseEntity<AdminUserRowDTO> setUserEnabled(
            @PathVariable String userId,
            @RequestBody SetUserEnabledDTO body,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(adminService.setUserEnabled(userId, body.isEnabled(), admin));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(
            @PathVariable String userId,
            @AuthenticationPrincipal User admin) {
        adminService.deleteUser(userId, admin);
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/workspaces")
    public ResponseEntity<PagedResponseDTO<AdminWorkspaceRowDTO>> listWorkspaces(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.listWorkspaces(q, page, size));
    }

    @DeleteMapping("/workspaces/{workspaceId}")
    public ResponseEntity<String> deleteWorkspace(@PathVariable String workspaceId) {
        adminService.deleteWorkspace(workspaceId);
        return ResponseEntity.ok("Workspace deleted successfully");
    }
}
