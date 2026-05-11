package com.softwareproject.LinkUp.dtos;

import com.softwareproject.LinkUp.enums.ProjectPriority;
import com.softwareproject.LinkUp.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ProjectDTO {
    private String name;
    private String description;
    private ProjectPriority projectPriority;
    private ProjectStatus projectStatus;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer progress;
    private LocalDateTime createdAt;
    private String workspaceId;
    private List<String> addedEmails;
}
