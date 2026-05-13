package com.softwareproject.LinkUp.controllers;

import com.softwareproject.LinkUp.dtos.TaskDTO;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.enums.TaskStatus;
import com.softwareproject.LinkUp.services.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @DeleteMapping("/delete/{taskId}")
    public ResponseEntity<String> deleteTask(@PathVariable String taskId) {
        return ResponseEntity.ok(taskService.deleteTask(
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
                taskId));
    }

    @PatchMapping("/updatestatus/{taskId}")
    public ResponseEntity<String> updateTaskStatus(@PathVariable String taskId, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
                taskId, status));
    }

    @PatchMapping("/changeassignee/{taskId}")
    public ResponseEntity<String> changeAssignee(@PathVariable String taskId, @RequestParam String assigneeEmail) {
        return ResponseEntity.ok(taskService.changeAssignee(
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
                taskId, assigneeEmail));
    }


    @GetMapping("/get/{taskId}")
    public ResponseEntity<TaskDTO> getTask(@PathVariable String taskId) {
        return ResponseEntity.ok(taskService.getTask(
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
                taskId));
    }

    @GetMapping("/getall/{projectId}")
    public ResponseEntity<List<TaskDTO>> getTasks(@PathVariable String projectId) {
        return ResponseEntity.ok(taskService.getTasks(
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal(),
                projectId));
    }




}