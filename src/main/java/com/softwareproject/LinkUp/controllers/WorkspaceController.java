package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.WorkspaceDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.services.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workspaces")
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @PostMapping("/create")
    public ResponseEntity<String> createWorkspace(@RequestBody WorkspaceDTO workspaceDTO){
        User user= (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        workspaceService.createWorkSpace(user,workspaceDTO);
        return ResponseEntity.ok("Workspace created Successfully");

    }

}
