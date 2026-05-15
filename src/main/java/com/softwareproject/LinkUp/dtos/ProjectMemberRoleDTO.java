package com.softwareproject.LinkUp.dtos;

import com.softwareproject.LinkUp.enums.ProjectRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectMemberRoleDTO {
    private UserDTO userDTO;
    private ProjectRole role;
}