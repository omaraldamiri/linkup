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
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;


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


    public String deleteTask(User currentUser, String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        ProjectMember projectMember = projectMemberRepository.findByUserAndProject(currentUser, task.getProject())
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        if(projectMember.getRole() != ProjectRole.LEADER)
            throw new UnAuthorizedException("Unauthorized");
        taskRepository.delete(task);
        return "Task deleted successfully";
    }

    public String updateTaskStatus(User currentUser, String taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        projectMemberRepository.findByUserAndProject(currentUser, task.getProject())
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        task.setTaskStatus(status);
        taskRepository.save(task);
        return "Task status updated to " + status;
    }

    public TaskDTO getTask(User currentUser, String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        projectMemberRepository.findByUserAndProject(currentUser, task.getProject())
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
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

    public List<TaskDTO> getTasks(User currentUser, String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectMemberRepository.findByUserAndProject(currentUser, project)
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        return taskRepository.findByProject(project)
                .stream()
                .map(t -> TaskDTO.builder()
                        .title(t.getTitle())
                        .description(t.getDescription())
                        .taskStatus(t.getTaskStatus())
                        .taskPriority(t.getTaskPriority())
                        .taskType(t.getTaskType())
                        .dueTime(t.getDueTime())
                        .projectId(project.getId())
                        .assigneeEmail(t.getAssignee().getEmail())
                        .createdAt(t.getCreatedAt())
                        .build())
                .toList();
    }

    public String changeAssignee(User currentUser, String taskId, String assigneeEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        ProjectMember projectMember = projectMemberRepository.findByUserAndProject(currentUser, task.getProject())
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        if(projectMember.getRole() != ProjectRole.LEADER)
            throw new UnAuthorizedException("Unauthorized");
        User assignee = userRepository.findByEmail(assigneeEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        task.setAssignee(assignee);
        taskRepository.save(task);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(assignee.getEmail());
        message.setSubject("You have been assigned to a task");
        message.setText("You have been assigned to task: " + task.getTitle() + " in project: " + task.getProject().getName());
        mailSender.send(message);
        return assignee.getName() + " is now assigned to " + task.getTitle();
    }
}
