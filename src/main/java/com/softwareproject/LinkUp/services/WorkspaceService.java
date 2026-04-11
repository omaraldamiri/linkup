package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.dtos.AddingMemberDTO;
import com.softwareproject.LinkUp.dtos.EditingRoleDTO;
import com.softwareproject.LinkUp.dtos.RemovingMemberDTO;
import com.softwareproject.LinkUp.dtos.WorkspaceDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.entities.WorkspaceMember;
import com.softwareproject.LinkUp.enums.WorkspaceRole;
import com.softwareproject.LinkUp.exceptions.*;
import com.softwareproject.LinkUp.repos.UserRepository;
import com.softwareproject.LinkUp.repos.WorkspaceMemberRepository;
import com.softwareproject.LinkUp.repos.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    public List<Workspace> returnAllWorkspaces(){
        return workspaceRepository.findAll();
    }



        public void createWorkSpace(User user, WorkspaceDTO workspaceDTO){
            if(workspaceRepository.findByName(workspaceDTO.getName()).isPresent())
                throw new WorkspaceNameExistsException("Name already exists! try another one");

            if(workspaceRepository.findBySlug(workspaceDTO.getSlug()).isPresent())
                throw new SlugAlreadyExistsException("Slug already exists! try another one");

            Workspace workspace=Workspace.builder().name(workspaceDTO.getName())
                    .imageUrl(workspaceDTO.getImageUrl()).slug(workspaceDTO.getSlug())
                    .description(workspaceDTO.getDescription()).build();
            workspaceRepository.save(workspace);

            WorkspaceMember workspaceMember= WorkspaceMember.builder()
                    .workspace(workspace)
                    .user(user)
                    .role(WorkspaceRole.OWNER)
                    .build();
            workspaceMemberRepository.save(workspaceMember);
    }
    public void inviteMember(AddingMemberDTO addingMemberDTO,User currentUser){
        User user=userRepository.findByEmail(addingMemberDTO.getUserEmail()).orElseThrow(()->new UsernameNotFoundException("User Not found!"));
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

    public void removeMember(RemovingMemberDTO removingMemberDTO,User currentUser){
        Workspace workspace=workspaceRepository.findById(removingMemberDTO.getWorkSpaceId()).
                orElseThrow(()-> new RuntimeException("Error happened receiving workspace id (removing User)"));
        WorkspaceMember currentworkspaceMember=workspaceMemberRepository.findByUserAndWorkspace(currentUser,workspace).orElseThrow(
                ()-> new RuntimeException("Error happened in (removing User)")
        );
        if(currentworkspaceMember.getRole()!=WorkspaceRole.OWNER)
            throw new UnAuthorizedException("You don't have the right permission");

        User user=userRepository.findById(removingMemberDTO.getUserId()).orElseThrow(
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




}
