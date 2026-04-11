package com.softwareproject.LinkUp.dtos;

import com.softwareproject.LinkUp.entities.Workspace;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class AuthResponse {
    private String token;
    private UserDTO userDTO;
    private List<WorkspaceDTO> workspaceDTOList=new ArrayList<>();

}
