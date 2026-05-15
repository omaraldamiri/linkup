package com.softwareproject.LinkUp.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.softwareproject.LinkUp.enums.ProjectPriority;
import com.softwareproject.LinkUp.enums.ProjectRole;
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
    private String id;
    private String name;
    private String description;
    private ProjectPriority projectPriority;
    private ProjectStatus projectStatus;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime startDate;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime endDate;
    private Integer progress;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime createdAt;
    private String workspaceId;
    private List<String> addedEmails;
    /** Authenticated user's role in this project. */
    private ProjectRole currentUserRole;
}
