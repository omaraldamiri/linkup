package com.softwareproject.LinkUp.dtos;

import com.softwareproject.LinkUp.enums.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class AddingMemberDTO {
    private String userEmail;
    private String workSpaceId;
    private WorkspaceRole workspaceRole;
}
