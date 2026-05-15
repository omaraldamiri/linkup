package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.dtos.TaskDTO;
import com.softwareproject.LinkUp.entities.Project;
import com.softwareproject.LinkUp.entities.ProjectMember;
import com.softwareproject.LinkUp.entities.Task;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.enums.ProjectRole;
import com.softwareproject.LinkUp.enums.TaskStatus;
import com.softwareproject.LinkUp.exceptions.UnAuthorizedException;
import com.softwareproject.LinkUp.repos.ProjectMemberRepository;
import com.softwareproject.LinkUp.repos.ProjectRepository;
import com.softwareproject.LinkUp.repos.TaskRepository;
import com.softwareproject.LinkUp.repos.UserRepository;
import com.softwareproject.LinkUp.repos.WorkspaceMemberRepository;
import com.softwareproject.LinkUp.repos.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String mailFrom;

    public TaskDTO createTask(User currentUser, String projectId, TaskDTO taskDTO) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        ProjectMember projectMember = projectMemberRepository.findByUserAndProject(currentUser, project)
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        if (projectMember.getRole() != ProjectRole.LEADER)
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

        // Notify assignee about the new task
        sendTaskAssignedEmail(assignee, task, project);

        return TaskDTO.builder()
                .id(task.getId())
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
        if (projectMember.getRole() != ProjectRole.LEADER)
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
                .id(task.getId())
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
                        .id(t.getId())
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

    /**
     * Total tasks across all projects in the workspace that the user belongs to.
     * Caller must be a member of the workspace.
     */
    public long countTasksForWorkspace(User currentUser, String workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        workspaceMemberRepository.findByUserAndWorkspace(currentUser, workspace)
                .orElseThrow(() -> new UnAuthorizedException("You are not in this workspace"));
        return taskRepository.countByWorkspaceForUser(currentUser, workspaceId);
    }

    public List<TaskDTO> getTasksForWorkspace(User currentUser, String workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        workspaceMemberRepository.findByUserAndWorkspace(currentUser, workspace)
                .orElseThrow(() -> new UnAuthorizedException("You are not in this workspace"));
        return taskRepository.findByWorkspaceForUser(currentUser, workspaceId)
                .stream()
                .map(t -> TaskDTO.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .description(t.getDescription())
                        .taskStatus(t.getTaskStatus())
                        .taskPriority(t.getTaskPriority())
                        .taskType(t.getTaskType())
                        .dueTime(t.getDueTime())
                        .projectId(t.getProject().getId())
                        .assigneeEmail(t.getAssignee().getEmail())
                        .createdAt(t.getCreatedAt())
                        .updatedAt(t.getUpdatedAt())
                        .build())
                .toList();
    }

    public String changeAssignee(User currentUser, String taskId, String assigneeEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        ProjectMember projectMember = projectMemberRepository.findByUserAndProject(currentUser, task.getProject())
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        if (projectMember.getRole() != ProjectRole.LEADER)
            throw new UnAuthorizedException("Unauthorized");
        User assignee = userRepository.findByEmail(assigneeEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        task.setAssignee(assignee);
        taskRepository.save(task);

        // Notify new assignee about the reassignment
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(assignee.getEmail());
        message.setSubject("You have been assigned to a task");
        message.setText("You have been assigned to task: " + task.getTitle()
                + " in project: " + task.getProject().getName());
        mailSender.send(message);

        return assignee.getName() + " is now assigned to " + task.getTitle();
    }

    // ── Scheduled deadline reminder ───────────────────────────────────────────
    //
    // Runs every day at 08:00 server time (JVM default zone).
    // Finds incomplete tasks whose dueTime falls within today and emails the assignee.
    // Scheduling is enabled via SchedulingConfig.

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void sendDeadlineReminders() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        List<Task> tasksDueToday = taskRepository.findByDueTimeBetweenAndTaskStatusNot(
                startOfDay, endOfDay, TaskStatus.DONE);

        for (Task task : tasksDueToday) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(mailFrom);
                message.setTo(task.getAssignee().getEmail());
                message.setSubject("Task deadline reminder: " + task.getTitle());
                message.setText(
                        "Hi " + task.getAssignee().getName() + ",\n\n"
                        + "This is a reminder that the following task is due today:\n\n"
                        + "  Task:    " + task.getTitle() + "\n"
                        + "  Project: " + task.getProject().getName() + "\n"
                        + "  Due:     " + task.getDueTime() + "\n\n"
                        + "Please make sure to complete it before the end of the day.\n\n"
                        + "— LinkUp"
                );
                mailSender.send(message);
            } catch (Exception e) {
                // Log and continue — one bad email address should not abort the whole batch
                System.err.println("Failed to send deadline reminder for task "
                        + task.getId() + ": " + e.getMessage());
            }
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void sendTaskAssignedEmail(User assignee, Task task, Project project) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(assignee.getEmail());
        message.setSubject("New task assigned to you: " + task.getTitle());
        message.setText(
                "Hi " + assignee.getName() + ",\n\n"
                + "A new task has been assigned to you:\n\n"
                + "  Task:    " + task.getTitle() + "\n"
                + "  Project: " + project.getName() + "\n"
                + (task.getDescription() != null
                        ? "  Description: " + task.getDescription() + "\n"
                        : "")
                + (task.getDueTime() != null
                        ? "  Due:     " + task.getDueTime() + "\n"
                        : "")
                + "\n— LinkUp"
        );
        mailSender.send(message);
    }
}