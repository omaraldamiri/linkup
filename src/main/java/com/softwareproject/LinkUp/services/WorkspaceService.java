package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.dtos.*;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.entities.WorkspaceMember;
import com.softwareproject.LinkUp.enums.WorkspaceRole;
import com.softwareproject.LinkUp.exceptions.*;
import com.softwareproject.LinkUp.repos.UserRepository;
import com.softwareproject.LinkUp.repos.WorkspaceMemberRepository;
import com.softwareproject.LinkUp.repos.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;


    public WorkspaceDTO createWorkSpace(User user, WorkspaceDTO workspaceDTO) {
    if (workspaceRepository.findByName(workspaceDTO.getName()).isPresent())
        throw new WorkspaceNameExistsException("Name already exists! try another one");

    if (workspaceRepository.findBySlug(workspaceDTO.getSlug()).isPresent())
        throw new SlugAlreadyExistsException("Slug already exists! try another one");
    
    Workspace workspace = Workspace.builder()
            .name(workspaceDTO.getName())
            .imageUrl(workspaceDTO.getImageUrl())
            .slug(workspaceDTO.getSlug())
            .description(workspaceDTO.getDescription())
            .build();
    workspaceRepository.save(workspace);
    
    WorkspaceMember workspaceMember = WorkspaceMember.builder()
            .workspace(workspace)
            .user(user)
            .role(WorkspaceRole.OWNER)
            .build();
    workspaceMemberRepository.save(workspaceMember);

    // Return the saved workspace as DTO — use workspace.getId() for the real DB id
    return WorkspaceDTO.builder()
            .id(workspace.getId())
            .name(workspace.getName())
            .imageUrl(workspace.getImageUrl())
            .slug(workspace.getSlug())
            .description(workspace.getDescription())
            .build();
}


    public void inviteMember(AddingMemberDTO addingMemberDTO,User currentUser){
        User user=userRepository.findByEmail(addingMemberDTO.getUserEmail()).orElseThrow(()->new UserNotFoundException("User Not found!"));
        Workspace workspace=workspaceRepository.findById(addingMemberDTO.getWorkSpaceId()).orElseThrow(()->new RuntimeException("Workspace id is invalid"));
        WorkspaceMember workspaceMember=workspaceMemberRepository.findByUserAndWorkspace(currentUser,workspace).orElseThrow(()->new RuntimeException("Error Happened!"));
        if(workspaceMember.getRole()!=WorkspaceRole.OWNER)
            throw new UnAuthorizedException("UnAuthorized");

        if(workspaceMemberRepository.findByUserAndWorkspace(user,workspace).isPresent())
            throw new UserAlreadyExistsInWorkspace("User already exists in workspace");


        WorkspaceMember tempWorkspaceMember=WorkspaceMember.builder()
                .user(user)
                .workspace(workspace)
                .role(addingMemberDTO.getWorkSpaceRole())
                .build();
        workspaceMemberRepository.save(tempWorkspaceMember);
    }

    public void removeMember(String workspaceId , String userId,User currentUser){
        Workspace workspace=workspaceRepository.findById(workspaceId).
                orElseThrow(()-> new RuntimeException("Error happened receiving workspace id (removing User)"));
        WorkspaceMember currentworkspaceMember=workspaceMemberRepository.findByUserAndWorkspace(currentUser,workspace).orElseThrow(
                ()-> new RuntimeException("Error happened in (removing User)")
        );
        if(currentworkspaceMember.getRole()!=WorkspaceRole.OWNER)
            throw new UnAuthorizedException("You don't have the right permission");

        User user=userRepository.findById(userId).orElseThrow(
                ()-> new RuntimeException("User not found (removing User)")
        );
        WorkspaceMember removedWorkSpaceMember=workspaceMemberRepository.findByUserAndWorkspace(user,workspace).orElseThrow(
                ()->new RuntimeException("User doesn't belong to this workspace")
        );

        if(removedWorkSpaceMember.getRole()==WorkspaceRole.OWNER)
            throw new UnAuthorizedException("You can't remove a user that has owner role");

        workspaceMemberRepository.delete(removedWorkSpaceMember);



    }

    public void editingMemberRole(EditingRoleDTO editingRoleDTO,User currentUser){
        Workspace workspace=workspaceRepository.findById(editingRoleDTO.getWorkSpaceId()).
                orElseThrow(()-> new RuntimeException("Error happened receiving workspace id (removing User)"));
        WorkspaceMember currentworkspaceMember=workspaceMemberRepository.findByUserAndWorkspace(currentUser,workspace).orElseThrow(
                ()-> new RuntimeException("Error happened in (removing User)")
        );
        if(currentworkspaceMember.getRole()!= WorkspaceRole.OWNER)
            throw new UnAuthorizedException("You don't have the right permission");

        User user=userRepository.findById(editingRoleDTO.getUserId()).orElseThrow(
                ()-> new RuntimeException("User not found (editing User Role)")
        );
        WorkspaceMember editedWorkSpaceMember=workspaceMemberRepository.findByUserAndWorkspace(user,workspace).orElseThrow(
                ()->new RuntimeException("User doesn't belong to this workspace")
        );

        if(editedWorkSpaceMember.getRole()==editingRoleDTO.getNewRole())
            throw new UserAlreadyHasRoleException("User already has this role!");

        editedWorkSpaceMember.setRole(editingRoleDTO.getNewRole());
        workspaceMemberRepository.save(editedWorkSpaceMember);


    }

    /** GET /workspaces/my — returns all workspaces the authenticated user belongs to */
    public List<WorkspaceDTO> getMyWorkspaces(User user) {
        return getWorkspacesDTO(workspaceRepository.findByUser(user));
    }

    public List<WorkspaceDTO> getWorkspacesDTO(List<Workspace> list){



        return
                list.stream()
                        .map(w->WorkspaceDTO
                                .builder()
                                .id(w.getId())
                                .name(w.getName())
                                .slug(w.getSlug())
                                .imageUrl(w.getImageUrl())
                                .description(w.getDescription()).build())
                        .collect(Collectors.toList());

    }


    public List<UserRoleDTO> returnWorkspaceMember(String id){
            List<WorkspaceMember> workspaceMemberList=workspaceMemberRepository.findByWorkspace(workspaceRepository.findById(id).orElseThrow(()->
                    new RuntimeException("workspace id not found")));



          return workspaceMemberList.stream()
                    .map(w-> UserRoleDTO.builder()
                            .userDTO(UserDTO.builder()
                                    .name(w.getUser().getName())
                                    .email(w.getUser().getEmail())
                                    .id(w.getUser().getId())
                                    .image(w.getUser().getImage())
                                    .build())
                            .role(w.getRole()).build())
                  .toList();
    }


    public String deleteWorkspace(String workspaceId , User user) {
            Workspace workspace=workspaceRepository.findById(workspaceId).orElseThrow(
                    () -> new RuntimeException("Workspace with this id not found"));
            WorkspaceMember workspaceMember=workspaceMemberRepository.findByUserAndWorkspace(user,workspace)
                    .orElseThrow(()-> new RuntimeException("User doesn't belong to this workspace"));
            if(workspaceMember.getRole()!=WorkspaceRole.OWNER)
                throw new UnAuthorizedException("User doesn't has permission deleting");

            workspaceRepository.delete(workspace);

            return "Workspace with id " + workspaceId + " deleted successfully";


    }
}