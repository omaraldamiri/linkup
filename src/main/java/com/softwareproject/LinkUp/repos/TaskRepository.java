package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task,String> {
}
