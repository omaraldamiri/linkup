package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.dtos.TaskDTO;
import com.softwareproject.LinkUp.entities.Project;
import com.softwareproject.LinkUp.entities.ProjectMember;
import com.softwareproject.LinkUp.entities.Task;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.enums.ProjectRole;
import com.softwareproject.LinkUp.enums.TaskStatus;
import com.softwareproject.LinkUp.exceptions.UnAuthorizedException;
import com.softwareproject.LinkUp.repos.ProjectMemberRepository;
import com.softwareproject.LinkUp.repos.ProjectRepository;
import com.softwareproject.LinkUp.repos.TaskRepository;
import com.softwareproject.LinkUp.repos.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public TaskDTO createTask(User currentUser, String projectId, TaskDTO taskDTO) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        ProjectMember projectMember = projectMemberRepository.findByUserAndProject(currentUser, project)
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        if(projectMember.getRole() != ProjectRole.LEADER)
            throw new UnAuthorizedException("Unauthorized");
        User assignee = userRepository.findByEmail(taskDTO.getAssigneeEmail())
                .orElseThrow(() -> new RuntimeException("Assignee not found"));
        Task task = Task.builder()
                .title(taskDTO.getTitle())
                .description(taskDTO.getDescription())
                .taskStatus(TaskStatus.TODO)
                .taskPriority(taskDTO.getTaskPriority())
                .taskType(taskDTO.getTaskType())
                .dueTime(taskDTO.getDueTime())
                .project(project)
                .assignee(assignee)
                .build();
        taskRepository.save(task);
        return TaskDTO.builder()
                .title(task.getTitle())
                .description(task.getDescription())
                .taskStatus(task.getTaskStatus())
                .taskPriority(task.getTaskPriority())
                .taskType(task.getTaskType())
                .dueTime(task.getDueTime())
                .projectId(task.getProject().getId())
                .assigneeEmail(task.getAssignee().getEmail())
                .createdAt(task.getCreatedAt())
                .build();
    }
}
