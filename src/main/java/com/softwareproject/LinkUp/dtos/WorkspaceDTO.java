package com.softwareproject.LinkUp.dtos;

import jakarta.persistence.EntityListeners;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor

public class WorkspaceDTO {
    private String name;
    private String imageUrl;
    private String slug;
    private String description;
}
