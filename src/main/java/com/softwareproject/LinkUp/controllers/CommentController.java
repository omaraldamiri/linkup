package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.CommentDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.services.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/comments")
public class CommentController {
    private final CommentService commentService;
    @PostMapping("/create/{taskId}")
    public ResponseEntity<CommentDTO> createComment(@PathVariable String taskId, @RequestParam String content) {
        return ResponseEntity.ok(commentService.createComment(
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
                taskId, content));
    }
    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable String commentId) {
        return ResponseEntity.ok(commentService.deleteComment(
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
                commentId));
    }

    @GetMapping("/get/{taskId}")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable String taskId) {
        return ResponseEntity.ok(commentService.getComments(
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
                taskId));
    }



}
