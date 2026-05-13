package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.dtos.CommentDTO;
import com.softwareproject.LinkUp.entities.Comment;
import com.softwareproject.LinkUp.entities.Task;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.exceptions.UnAuthorizedException;
import com.softwareproject.LinkUp.repos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    public CommentDTO createComment(User currentUser, String taskId, String content) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        projectMemberRepository.findByUserAndProject(currentUser, task.getProject())
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        Comment comment = Comment.builder()
                .content(content)
                .task(task)
                .user(currentUser)
                .build();
        commentRepository.save(comment);
        return CommentDTO.builder()
                .content(comment.getContent())
                .userEmail(currentUser.getEmail())
                .taskId(task.getId())
                .createdAt(comment.getCreatedAt())
                .build();
    }
    public String deleteComment(User currentUser, String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if(!comment.getUser().getId().equals(currentUser.getId()))
            throw new UnAuthorizedException("You can only delete your own comments");
        commentRepository.delete(comment);
        return "Comment deleted successfully";
    }

    public List<CommentDTO> getComments(User currentUser, String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        projectMemberRepository.findByUserAndProject(currentUser, task.getProject())
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        return commentRepository.findByTask(task)
                .stream()
                .map(c -> CommentDTO.builder()
                        .content(c.getContent())
                        .userEmail(c.getUser().getEmail())
                        .taskId(task.getId())
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();
    }



}
