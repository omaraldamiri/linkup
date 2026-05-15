package com.softwareproject.LinkUp.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.softwareproject.LinkUp.enums.TaskPriority;
import com.softwareproject.LinkUp.enums.TaskStatus;
import com.softwareproject.LinkUp.enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private String id;
    private String title;
    private String description;
    private TaskStatus taskStatus;
    private TaskPriority taskPriority;
    private TaskType taskType;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime dueTime;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime updatedAt;
    private String assigneeEmail;
    private String projectId;
}
