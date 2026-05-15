package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.dtos.*;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.entities.WorkspaceInvitation;
import com.softwareproject.LinkUp.entities.WorkspaceMember;
import com.softwareproject.LinkUp.enums.WorkspaceRole;
import com.softwareproject.LinkUp.exceptions.*;
import com.softwareproject.LinkUp.repos.UserRepository;
import com.softwareproject.LinkUp.repos.WorkspaceInvitationRepository;
import com.softwareproject.LinkUp.repos.WorkspaceMemberRepository;
import com.softwareproject.LinkUp.repos.WorkspaceRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceInvitationRepository workspaceInvitationRepository;
    private final UserRepository userRepository;
    private final WorkspaceInviteMailService workspaceInviteMailService;


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


    public void inviteMember(AddingWorkspaceMemberDTO addingMemberDTO, User currentUser) {
        User invitee = userRepository.findByEmail(addingMemberDTO.getUserEmail())
                .orElseThrow(() -> new UserNotFoundException("User Not found!"));
        Workspace workspace = workspaceRepository.findById(addingMemberDTO.getWorkSpaceId())
                .orElseThrow(() -> new RuntimeException("Workspace id is invalid"));
        WorkspaceMember inviterMembership = workspaceMemberRepository.findByUserAndWorkspace(currentUser, workspace)
                .orElseThrow(() -> new RuntimeException("Error Happened!"));
        if (inviterMembership.getRole() != WorkspaceRole.OWNER) {
            throw new UnAuthorizedException("UnAuthorized");
        }
        if (workspaceMemberRepository.findByUserAndWorkspace(invitee, workspace).isPresent()) {
            throw new UserAlreadyExistsInWorkspace("User already exists in workspace");
        }

        workspaceInvitationRepository.findByWorkspaceAndInvitedUser(workspace, invitee)
                .ifPresent(workspaceInvitationRepository::delete);

        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);

        WorkspaceInvitation invitation = WorkspaceInvitation.builder()
                .workspace(workspace)
                .invitedUser(invitee)
                .invitedBy(currentUser)
                .role(addingMemberDTO.getWorkSpaceRole())
                .token(token)
                .expiresAt(expiresAt)
                .build();
        workspaceInvitationRepository.save(invitation);

        try {
            workspaceInviteMailService.sendWorkspaceInvite(workspace, invitee, currentUser,
                    addingMemberDTO.getWorkSpaceRole(), token);
        } catch (MessagingException e) {
            workspaceInvitationRepository.delete(invitation);
            throw new RuntimeException("Could not send invitation email. Check mail configuration.");
        }
    }

    @Transactional
    public String acceptWorkspaceInvitation(AcceptWorkspaceInvitationDTO dto, User currentUser) {
        if (dto.getToken() == null || dto.getToken().isBlank()) {
            throw new BadInvitationTokenException("Invitation token is required");
        }
        WorkspaceInvitation invitation = workspaceInvitationRepository.findByToken(dto.getToken().trim())
                .orElseThrow(() -> new BadInvitationTokenException("Invalid or expired invitation"));

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            workspaceInvitationRepository.delete(invitation);
            throw new InvitationExpiredException("This invitation has expired");
        }
        if (!invitation.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new InvitationForbiddenException("You must be signed in as the invited user to accept");
        }

        Workspace workspace = invitation.getWorkspace();
        User invitee = invitation.getInvitedUser();
        if (workspaceMemberRepository.findByUserAndWorkspace(invitee, workspace).isPresent()) {
            workspaceInvitationRepository.delete(invitation);
            throw new UserAlreadyExistsInWorkspace("You are already a member of this workspace");
        }

        WorkspaceMember member = WorkspaceMember.builder()
                .user(invitee)
                .workspace(workspace)
                .role(invitation.getRole())
                .build();
        workspaceMemberRepository.save(member);
        workspaceInvitationRepository.delete(invitation);
        return "You have joined workspace \"" + workspace.getName() + "\".";
    }

    public List<PendingWorkspaceInvitationDTO> getPendingInvitations(String workspaceId, User currentUser) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("workspace id not found"));
        WorkspaceMember membership = workspaceMemberRepository.findByUserAndWorkspace(currentUser, workspace)
                .orElseThrow(() -> new RuntimeException("Error Happened!"));
        if (membership.getRole() != WorkspaceRole.OWNER) {
            throw new UnAuthorizedException("UnAuthorized");
        }
        return workspaceInvitationRepository.findByWorkspace(workspace).stream()
                .map(inv -> PendingWorkspaceInvitationDTO.builder()
                        .id(inv.getId())
                        .inviteeEmail(inv.getInvitedUser().getEmail())
                        .inviteeName(inv.getInvitedUser().getName())
                        .role(inv.getRole())
                        .createdAt(inv.getCreatedAt())
                        .expiresAt(inv.getExpiresAt())
                        .build())
                .toList();
    }

    public void revokeWorkspaceInvitation(String invitationId, User currentUser) {
        WorkspaceInvitation invitation = workspaceInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new BadInvitationTokenException("Invitation not found"));
        Workspace workspace = invitation.getWorkspace();
        WorkspaceMember membership = workspaceMemberRepository.findByUserAndWorkspace(currentUser, workspace)
                .orElseThrow(() -> new RuntimeException("Error Happened!"));
        if (membership.getRole() != WorkspaceRole.OWNER) {
            throw new UnAuthorizedException("UnAuthorized");
        }
        workspaceInvitationRepository.delete(invitation);
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

    public void editingMemberRole(EditingWorkspaceRoleDTO editingRoleDTO, User currentUser){
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
        if(editedWorkSpaceMember.getRole() == WorkspaceRole.OWNER)
            throw new UnAuthorizedException("Cannot change the role of a OWNER");

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