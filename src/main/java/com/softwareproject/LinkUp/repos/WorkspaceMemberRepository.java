package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.entities.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember,String> {
    Optional<WorkspaceMember> findByUserAndWorkspace(User user, Workspace workspace);
    List<WorkspaceMember> findByWorkspace(Workspace workspace);
}
