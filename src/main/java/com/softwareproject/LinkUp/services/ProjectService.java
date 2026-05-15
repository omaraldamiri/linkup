package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.dtos.EditingProjectRoleDTO;
import com.softwareproject.LinkUp.dtos.ProjectMemberRoleDTO;
import com.softwareproject.LinkUp.dtos.ProjectDTO;
import com.softwareproject.LinkUp.dtos.UpdateProjectDTO;
import com.softwareproject.LinkUp.dtos.UserDTO;
import com.softwareproject.LinkUp.entities.*;
import com.softwareproject.LinkUp.enums.ProjectRole;
import com.softwareproject.LinkUp.enums.ProjectStatus;
import com.softwareproject.LinkUp.exceptions.UnAuthorizedException;
import com.softwareproject.LinkUp.exceptions.UserAlreadyHasRoleException;
import com.softwareproject.LinkUp.repos.*;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
   final private WorkspaceRepository workspaceRepository;
   final private WorkspaceMemberRepository workspaceMemberRepository;
   final private ProjectRepository projectRepository;
   final private ProjectMemberRepository projectMemberRepository;
   final private UserRepository userRepository;
   final private JavaMailSender mailSender;

    public ProjectDTO createProject(ProjectDTO projectDTO, User user){
        Workspace workspace=workspaceRepository.findById(projectDTO.getWorkspaceId()).
                orElseThrow(()-> new RuntimeException("workspace not found "));
        WorkspaceMember workspaceMember=workspaceMemberRepository.findByUserAndWorkspace(user,workspace)
                .orElseThrow(() -> new UnAuthorizedException("Not a member of this workspace"));
        if(projectRepository.existsByNameAndWorkspace(projectDTO.getName(),workspace))
            throw new RuntimeException("Project name already exists in this workspace");

        Project project=Project.builder().name(projectDTO.getName())
                .description(projectDTO.getDescription())
                .projectStatus(ProjectStatus.PLANNING)
                .progress(0)
                .projectPriority(projectDTO.getProjectPriority())
                .startDate(projectDTO.getStartDate())
                .endDate(projectDTO.getEndDate()).workspace(workspace).build();
        projectRepository.save(project);

        ProjectMember projectMember=ProjectMember.builder()
                .user(user).project(project).role(ProjectRole.LEADER).build();
        projectMemberRepository.save(projectMember);
        assignProjectMembers(projectDTO.getAddedEmails(),project);

        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .projectStatus(project.getProjectStatus())
                .progress(0)
                .projectPriority(project.getProjectPriority())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .workspaceId(project.getWorkspace().getId())
                .addedEmails(projectDTO.getAddedEmails())
                .createdAt(project.getCreatedAt())
                .currentUserRole(ProjectRole.LEADER)
                .build();
    }

    public void assignProjectMembers(List<String> membersEmail,Project project){
        for(String email : membersEmail){
            User user1=userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("user not found"));
            SimpleMailMessage message = new SimpleMailMessage();
            ProjectMember projectMember=ProjectMember.builder()
                    .user(user1).project(project).role(ProjectRole.VIEWER).build();
            projectMemberRepository.save(projectMember);
            message.setTo(email);
            message.setSubject("You've been invited to a project");
            message.setText("You have been added to project: " + project.getName());
            mailSender.send(message);
        }

    }

    public void deleteProject(String projectId, User user) {
        System.out.println(user.getEmail() );
        Project project=projectRepository.findById(projectId).orElseThrow(()->new RuntimeException("project not found"));
        ProjectMember projectMember=projectMemberRepository.findByUserAndProject(user,project).orElseThrow(()->
                new RuntimeException("User is not in the project")
        );

        if(projectMember.getRole()!=ProjectRole.LEADER)
            throw new UnAuthorizedException("Not authorized");
        projectRepository.delete(project);

    }

    public List<ProjectDTO> returnUserProjects(User user){
        return projectRepository.findUserProjects(user)
                .stream()
                .map(p -> ProjectDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .description(p.getDescription())
                        .projectPriority(p.getProjectPriority())
                        .projectStatus(p.getProjectStatus())
                        .startDate(p.getStartDate())
                        .endDate(p.getEndDate())
                        .progress(p.getProgress())
                        .createdAt(p.getCreatedAt())
                        .workspaceId(p.getWorkspace().getId())
                        .currentUserRole(resolveCurrentUserRole(p, user))
                        .build())
                .toList();
    }

    public  String editProject(String projectId, UpdateProjectDTO dto , User user) {
        Project project=projectRepository.findById(projectId).orElseThrow(()-> new RuntimeException("Project not found"));
        ProjectMember projectMember=projectMemberRepository.findByUserAndProject(user,project)
                .orElseThrow(()-> new RuntimeException("error happened "));
        if(projectMember.getRole()!=ProjectRole.LEADER)
            throw new UnAuthorizedException("UnAuthorized");
        if(dto.getName() != null) project.setName(dto.getName());
        if(dto.getDescription() != null) project.setDescription(dto.getDescription());
        if(dto.getProjectPriority() != null) project.setProjectPriority(dto.getProjectPriority());
        if(dto.getProjectStatus() != null) project.setProjectStatus(dto.getProjectStatus());
        if(dto.getStartDate() != null) project.setStartDate(dto.getStartDate());
        if(dto.getEndDate() != null) project.setEndDate(dto.getEndDate());
        if(dto.getProgress() != null) project.setProgress(dto.getProgress());
        projectRepository.save(project);
        return project.getName() + " has been updated!";
    }

    public  String removeUser(String projectId, String userId, User authedUser) {
        Project project=projectRepository.findById(projectId)
                .orElseThrow(()->new RuntimeException("Project not found"));
        ProjectMember authedUserProjectMember=projectMemberRepository.findByUserAndProject(authedUser,project)
                .orElseThrow(()-> new RuntimeException("autheduser not in project"));
        if(authedUserProjectMember.getRole()!=ProjectRole.LEADER)
            throw new UnAuthorizedException("Unauthorized");
        User user=userRepository.findById(userId).orElseThrow(()->new RuntimeException("User not found"));
        ProjectMember projectMember=projectMemberRepository.findByUserAndProject(user,project)
                .orElseThrow(()->new RuntimeException("User already not in project"));
        if(projectMember.getRole() == ProjectRole.LEADER)
            throw new UnAuthorizedException("Cannot remove a LEADER from the project");
        projectMemberRepository.delete(projectMember);
        return user.getName() + " has been removed from " + project.getName();
    }

    public String addUser(String projectId, String userEmail, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        ProjectMember currentMember = projectMemberRepository.findByUserAndProject(currentUser, project)
                .orElseThrow(() -> new RuntimeException("You are not in this project"));
        if(currentMember.getRole() != ProjectRole.LEADER)
            throw new UnAuthorizedException("Unauthorized");
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if(projectMemberRepository.findByUserAndProject(user, project).isPresent())
            throw new RuntimeException("User already exists in project");
        ProjectMember projectMember = ProjectMember.builder()
                .user(user)
                .project(project)
                .role(ProjectRole.VIEWER)
                .build();
        projectMemberRepository.save(projectMember);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("You've been invited to a project");
        message.setText("You have been added to project: " + project.getName());
        mailSender.send(message);
        return user.getName() + " has been added to " + project.getName();
    }

    public String editMemberRole(EditingProjectRoleDTO dto, User currentUser) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        ProjectMember currentMember = projectMemberRepository.findByUserAndProject(currentUser, project)
                .orElseThrow(() -> new RuntimeException("You are not in this project"));
        if(currentMember.getRole() != ProjectRole.LEADER)
            throw new UnAuthorizedException("Unauthorized");
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProjectMember editedMember = projectMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new RuntimeException("User not in this project"));
        if(editedMember.getRole() == ProjectRole.LEADER)
            throw new UnAuthorizedException("Cannot change the role of a LEADER");
        if(editedMember.getRole() == dto.getNewRole())
            throw new UserAlreadyHasRoleException("User already has this role");
        editedMember.setRole(dto.getNewRole());
        projectMemberRepository.save(editedMember);
        return "Role updated successfully";
    }
    public String changeProjectStatus(String projectId, ProjectStatus status, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        ProjectMember projectMember=projectMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        if(projectMember.getRole()!=ProjectRole.LEADER)
            throw new UnAuthorizedException("Unauthorized");
        project.setProjectStatus(status);
        projectRepository.save(project);
        return "Status updated to " + status;
    }

    public ProjectDTO getProjectDetails(String projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .projectPriority(project.getProjectPriority())
                .projectStatus(project.getProjectStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .progress(project.getProgress())
                .createdAt(project.getCreatedAt())
                .workspaceId(project.getWorkspace().getId())
                .currentUserRole(resolveCurrentUserRole(project, user))
                .build();
    }

    private ProjectRole resolveCurrentUserRole(Project project, User user) {
        return projectMemberRepository.findByUserAndProject(user, project)
                .map(ProjectMember::getRole)
                .orElse(null);
    }

    // now returns List<ProjectMemberRoleDTO> instead of List<UserDTO>
    public List<ProjectMemberRoleDTO> getProjectMembers(String projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new UnAuthorizedException("You are not in this project"));
        return projectMemberRepository.findByProject(project)
                .stream()
                .map(pm -> ProjectMemberRoleDTO.builder()
                        .userDTO(UserDTO.builder()
                                .id(pm.getUser().getId())
                                .name(pm.getUser().getName())
                                .email(pm.getUser().getEmail())
                                .image(pm.getUser().getImage())
                                .build())
                        .role(pm.getRole())
                        .build())
                .toList();
    }

}