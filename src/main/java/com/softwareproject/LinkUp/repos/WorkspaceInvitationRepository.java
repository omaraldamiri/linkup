package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.entities.WorkspaceInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation, String> {

    Optional<WorkspaceInvitation> findByToken(String token);

    Optional<WorkspaceInvitation> findByWorkspaceAndInvitedUser(Workspace workspace, User invitedUser);

    List<WorkspaceInvitation> findByWorkspace(Workspace workspace);
}
