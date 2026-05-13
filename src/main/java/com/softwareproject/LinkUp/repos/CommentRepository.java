package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.Comment;
import com.softwareproject.LinkUp.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment , String> {
    List<Comment> findByTask(Task task);
}
