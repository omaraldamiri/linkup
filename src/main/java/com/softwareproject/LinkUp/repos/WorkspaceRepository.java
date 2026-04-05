package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace,String> {
    Optional<Workspace> findBySlug(String slug);
    Optional<Workspace> findByName(String name);
}
