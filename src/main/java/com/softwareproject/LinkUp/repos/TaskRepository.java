package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.Project;
import com.softwareproject.LinkUp.entities.Task;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task,String> {
    List<Task> findByProject(Project project);

    /**
     * Tasks in projects that belong to {@code workspaceId} where {@code user} is a project member.
     */
    @Query("SELECT COUNT(t) FROM Task t JOIN t.project p JOIN p.workspace w JOIN p.projectMemberList pm "
            + "WHERE w.id = :workspaceId AND pm.user = :user")
    long countByWorkspaceForUser(@Param("user") User user, @Param("workspaceId") String workspaceId);

    @Query("SELECT t FROM Task t JOIN t.project p JOIN p.workspace w JOIN p.projectMemberList pm "
            + "WHERE w.id = :workspaceId AND pm.user = :user")
    List<Task> findByWorkspaceForUser(@Param("user") User user, @Param("workspaceId") String workspaceId);

    List<Task> findByDueTimeBetweenAndTaskStatusNot(
            LocalDateTime startInclusive,
            LocalDateTime endInclusive,
            TaskStatus excludedStatus);
}
