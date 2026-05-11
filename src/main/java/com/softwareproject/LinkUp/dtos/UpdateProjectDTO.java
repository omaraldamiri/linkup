package com.softwareproject.LinkUp.dtos;

import com.softwareproject.LinkUp.enums.ProjectPriority;
import com.softwareproject.LinkUp.enums.ProjectStatus;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectDTO {
    private String name;
    private String description;
    private ProjectPriority projectPriority;
    private ProjectStatus projectStatus;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer progress;
}