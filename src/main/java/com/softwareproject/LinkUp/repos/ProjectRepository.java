package com.softwareproject.LinkUp.repos;


import com.softwareproject.LinkUp.entities.Project;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    boolean existsByNameAndWorkspace(String name, Workspace workspace);
    @Query("SELECT p FROM Project p JOIN p.projectMemberList pm where pm.user = :user")
    List<Project> findUserProjects(@Param("user") User user);

}
