package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.TaskDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.services.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {
    final TaskService taskService;

    @PostMapping("/create/{projectId}")
    public ResponseEntity<TaskDTO> createTask(@PathVariable String projectId, @RequestBody TaskDTO taskDTO) {
        return ResponseEntity.ok(taskService.createTask(
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
                projectId, taskDTO));
    }

    
}