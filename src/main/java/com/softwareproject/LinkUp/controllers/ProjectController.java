package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.EditingProjectRoleDTO;
import com.softwareproject.LinkUp.dtos.ProjectDTO;
import com.softwareproject.LinkUp.dtos.UpdateProjectDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.enums.ProjectStatus;
import com.softwareproject.LinkUp.services.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/projects")
@RestController
public class ProjectController {
    final ProjectService projectService;
    @PostMapping("/create")
    public ResponseEntity<ProjectDTO> createProject(@RequestBody ProjectDTO projectDTO){

        return ResponseEntity.ok(projectService.createProject(projectDTO, (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()));
    }

    @DeleteMapping("/delete/{projectId}")
    public ResponseEntity<String> deleteProject(@PathVariable String projectId){
        projectService.deleteProject(projectId,(User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        return ResponseEntity.ok("Project deleted successfully");
    }

    @GetMapping("/getprojects")
    public ResponseEntity<List<ProjectDTO>> getUserProjects(){
        return ResponseEntity.ok(
                projectService.returnUserProjects((User)
                        SecurityContextHolder.getContext().getAuthentication()
                        .getPrincipal()));
    }

    @PatchMapping("/editproject/{projectId}")
    public ResponseEntity<String> editProject(@PathVariable String projectId,@RequestBody UpdateProjectDTO updateProjectDTO){

        return ResponseEntity.ok(projectService.editProject(projectId,updateProjectDTO,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()));
    }

    @PostMapping("/adduser/{projectId}")
    public ResponseEntity<String> addUser(@PathVariable String projectId, @RequestParam String userEmail) {
        return ResponseEntity.ok(projectService.addUser(projectId, userEmail,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()));
    }

    @DeleteMapping("/deleteuser/{projectId}/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId , @PathVariable String projectId){
        return ResponseEntity.ok(projectService.removeUser(projectId,userId,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()));
    }

    @PatchMapping("/editrole")
    public ResponseEntity<String> editMemberRole(@RequestBody EditingProjectRoleDTO dto) {
        return ResponseEntity.ok(projectService.editMemberRole(dto,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()));
    }

    @PatchMapping("/changestatus/{projectId}")
    public ResponseEntity<String> changeStatus(@PathVariable String projectId, @RequestParam ProjectStatus status) {
        return ResponseEntity.ok(projectService.changeProjectStatus(projectId, status,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()));
    }

    @GetMapping("/details/{projectId}")
    public ResponseEntity<ProjectDTO> getProjectDetails(@PathVariable String projectId) {
        return ResponseEntity.ok(projectService.getProjectDetails(projectId,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()));
    }

}
