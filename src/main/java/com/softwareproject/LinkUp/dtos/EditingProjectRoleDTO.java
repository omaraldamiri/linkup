package com.softwareproject.LinkUp.dtos;


import com.softwareproject.LinkUp.enums.ProjectRole;
import com.softwareproject.LinkUp.enums.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditingProjectRoleDTO {
    private String userId;
    private String projectId;
    private ProjectRole newRole;
}
