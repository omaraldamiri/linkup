package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace,String> {
    Optional<Workspace> findBySlug(String slug);
    Optional<Workspace> findByName(String name);
    @Query("SELECT w FROM Workspace w JOIN w.workspaceMemberList wm WHERE wm.user = :user")
    List<Workspace> findByUser(@Param("user")User user);
}
