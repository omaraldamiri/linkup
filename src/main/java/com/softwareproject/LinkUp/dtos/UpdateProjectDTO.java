package com.softwareproject.LinkUp.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime startDate;
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime endDate;
    private Integer progress;
}