package com.softwareproject.LinkUp.dtos;

import com.softwareproject.LinkUp.enums.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingWorkspaceInvitationDTO {
    private String id;
    private String inviteeEmail;
    private String inviteeName;
    private WorkspaceRole role;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
