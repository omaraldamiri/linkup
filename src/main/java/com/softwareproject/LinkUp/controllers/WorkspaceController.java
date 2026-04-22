package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.*;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.entities.WorkspaceMember;
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
    public ResponseEntity<String> createWorkspace(@RequestBody WorkspaceDTO workspaceDTO){
        User user= (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        workspaceService.createWorkSpace(user,workspaceDTO);
        return ResponseEntity.ok("Workspace created Successfully");

    }
    @PostMapping("/adduser")
    public ResponseEntity<String> inviteMember(@RequestBody AddingMemberDTO addingMemberDTO){
        workspaceService.inviteMember(addingMemberDTO,
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        return ResponseEntity.ok("User with the email : " + addingMemberDTO.getUserEmail() + " added succsefully!");
    }

        @DeleteMapping("/removeuser/{workspaceId}/{userId}")
        public ResponseEntity<String> removeMember(@PathVariable String workspaceId , @PathVariable String userId){
            workspaceService.removeMember(workspaceId,userId,
                            (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
            return ResponseEntity.ok("User removed successfully!");
        }
        @PatchMapping("/editrole")
        public ResponseEntity<String> editMemberRole(@RequestBody EditingRoleDTO editingRoleDTO){

            workspaceService.editingMemberRole(editingRoleDTO,
                    (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal());
            return ResponseEntity.ok("Role edited successfully");
        }

        @GetMapping("/getmembers/{workspaceId}")
        public ResponseEntity<List<UserRoleDTO>> getWorkspaceMembers(@PathVariable String workspaceId){
        return ResponseEntity.ok(workspaceService.returnWorkspaceMember(workspaceId));
        }
        @DeleteMapping("/delete/{workspaceId}")
        public ResponseEntity<String> deleteWorkspace(@PathVariable String workspaceId){
           return ResponseEntity.ok(workspaceService.deleteWorkspace(workspaceId,
                    (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()));
        }




}
