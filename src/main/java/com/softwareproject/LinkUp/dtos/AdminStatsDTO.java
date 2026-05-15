package com.softwareproject.LinkUp.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {
    private long totalUsers;
    private long totalWorkspaces;
    private long totalProjects;
    private long totalTasks;
    private long signupsLast7Days;
    private long signupsLast30Days;
}
