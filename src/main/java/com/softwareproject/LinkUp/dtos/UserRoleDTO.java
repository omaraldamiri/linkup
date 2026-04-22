package com.softwareproject.LinkUp.dtos;

import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.enums.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRoleDTO {
    private UserDTO userDTO;
    private WorkspaceRole role;
}
