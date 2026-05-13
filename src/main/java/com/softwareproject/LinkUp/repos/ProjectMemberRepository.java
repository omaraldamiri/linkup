package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.Project;
import com.softwareproject.LinkUp.entities.ProjectMember;
import com.softwareproject.LinkUp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember , String> {
    Optional<ProjectMember> findByUserAndProject(User user, Project project);
    List<ProjectMember> findByProject(Project project);
}
