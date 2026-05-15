package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.*;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.services.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workspaces")
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @PostMapping("/create")
    public ResponseEntity<WorkspaceDTO> createWorkspace(@RequestBody WorkspaceDTO workspaceDTO) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        WorkspaceDTO created = workspaceService.createWorkSpace(user, workspaceDTO);
        return ResponseEntity.status(201).body(created);
    }

    /**
     * Returns all workspaces the authenticated user belongs to, with full image data.
     * Used by the frontend after OAuth2 login to re-hydrate workspace images that were
     * intentionally stripped from the redirect URL to avoid exceeding nginx's
     * large_client_header_buffers limit.
     */
    @GetMapping("/my")
    public ResponseEntity<List<WorkspaceDTO>> getMyWorkspaces() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(workspaceService.getMyWorkspaces(user));
    }

    @PostMapping("/adduser")
    public ResponseEntity<String> inviteMember(@RequestBody AddingWorkspaceMemberDTO addingMemberDTO) {
        workspaceService.inviteMember(addingMemberDTO,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        return ResponseEntity.ok("Invitation sent to " + addingMemberDTO.getUserEmail()
                + ". They will be added after they accept the email link.");
    }

    @PostMapping("/invitations/accept")
    public ResponseEntity<String> acceptWorkspaceInvitation(@RequestBody AcceptWorkspaceInvitationDTO dto) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String message = workspaceService.acceptWorkspaceInvitation(dto, user);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/pending-invitations/{workspaceId}")
    public ResponseEntity<List<PendingWorkspaceInvitationDTO>> getPendingInvitations(
            @PathVariable String workspaceId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(workspaceService.getPendingInvitations(workspaceId, user));
    }

    @DeleteMapping("/invitations/{invitationId}")
    public ResponseEntity<String> revokeWorkspaceInvitation(@PathVariable String invitationId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        workspaceService.revokeWorkspaceInvitation(invitationId, user);
        return ResponseEntity.ok("Invitation cancelled.");
    }

    @DeleteMapping("/removeuser/{workspaceId}/{userId}")
    public ResponseEntity<String> removeMember(@PathVariable String workspaceId, @PathVariable String userId) {
        workspaceService.removeMember(workspaceId, userId,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        return ResponseEntity.ok("User removed successfully!");
    }

    @PatchMapping("/editrole")
    public ResponseEntity<String> editMemberRole(@RequestBody EditingWorkspaceRoleDTO editingRoleDTO) {
        workspaceService.editingMemberRole(editingRoleDTO,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        return ResponseEntity.ok("Role edited successfully");
    }

    @GetMapping("/getmembers/{workspaceId}")
    public ResponseEntity<List<UserRoleDTO>> getWorkspaceMembers(@PathVariable String workspaceId) {
        return ResponseEntity.ok(workspaceService.returnWorkspaceMember(workspaceId));
    }

    @DeleteMapping("/delete/{workspaceId}")
    public ResponseEntity<String> deleteWorkspace(@PathVariable String workspaceId) {
        return ResponseEntity.ok(workspaceService.deleteWorkspace(workspaceId,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()));
    }
}