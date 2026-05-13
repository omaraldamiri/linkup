package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.Project;
import com.softwareproject.LinkUp.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task,String> {
    List<Task> findByProject(Project project);
}
