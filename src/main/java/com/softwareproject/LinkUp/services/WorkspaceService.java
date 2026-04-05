package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.dtos.WorkspaceDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.entities.WorkspaceMember;
import com.softwareproject.LinkUp.enums.WorkspaceRole;
import com.softwareproject.LinkUp.exceptions.SlugAlreadyExistsException;
import com.softwareproject.LinkUp.exceptions.WorkspaceNameExistsException;
import com.softwareproject.LinkUp.repos.WorkspaceMemberRepository;
import com.softwareproject.LinkUp.repos.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
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
}
