package com.softwareproject.LinkUp.dtos;

import com.softwareproject.LinkUp.entities.Comment;
import com.softwareproject.LinkUp.entities.Project;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.enums.TaskPriority;
import com.softwareproject.LinkUp.enums.TaskStatus;
import com.softwareproject.LinkUp.enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private String title;
    private String description;
    private TaskStatus taskStatus;
    private TaskPriority taskPriority;
    private TaskType taskType;
    private LocalDateTime dueTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String assigneeEmail;
    private String projectId;
}
