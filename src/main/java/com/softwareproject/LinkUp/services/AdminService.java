package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.dtos.*;
import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.entities.WorkspaceMember;
import com.softwareproject.LinkUp.enums.WorkspaceRole;
import com.softwareproject.LinkUp.exceptions.AdminSelfActionException;
import com.softwareproject.LinkUp.exceptions.UserNotFoundException;
import com.softwareproject.LinkUp.repos.ProjectRepository;
import com.softwareproject.LinkUp.repos.TaskRepository;
import com.softwareproject.LinkUp.repos.UserRepository;
import com.softwareproject.LinkUp.repos.WorkspaceMemberRepository;
import com.softwareproject.LinkUp.repos.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public AdminStatsDTO getStats() {
        LocalDateTime now = LocalDateTime.now();
        return AdminStatsDTO.builder()
                .totalUsers(userRepository.count())
                .totalWorkspaces(workspaceRepository.count())
                .totalProjects(projectRepository.count())
                .totalTasks(taskRepository.count())
                .signupsLast7Days(userRepository.countByCreatedAtAfter(now.minusDays(7)))
                .signupsLast30Days(userRepository.countByCreatedAtAfter(now.minusDays(30)))
                .build();
    }

    public PagedResponseDTO<AdminUserRowDTO> listUsers(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String query = q == null ? "" : q.trim();
        Page<User> result = userRepository.searchUsers(query, pageable);
        return toPagedResponse(result, this::toUserRow);
    }

    public PagedResponseDTO<AdminWorkspaceRowDTO> listWorkspaces(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String query = q == null ? "" : q.trim();
        Page<Workspace> result = workspaceRepository.searchWorkspaces(query, pageable);
        return toPagedResponse(result, this::toWorkspaceRow);
    }

    @Transactional
    public AdminUserRowDTO setUserEnabled(String userId, boolean enabled, User admin) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (target.getId().equals(admin.getId())) {
            throw new AdminSelfActionException("You cannot change your own account status");
        }
        target.setEnabled(enabled);
        userRepository.save(target);
        return toUserRow(target);
    }

    @Transactional
    public void deleteUser(String userId, User admin) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (target.getId().equals(admin.getId())) {
            throw new AdminSelfActionException("You cannot delete your own account from admin");
        }
        userRepository.delete(target);
    }

    @Transactional
    public void deleteWorkspace(String workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace with this id not found"));
        workspaceRepository.delete(workspace);
    }

    private AdminUserRowDTO toUserRow(User user) {
        return AdminUserRowDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .oAuth2User(Boolean.TRUE.equals(user.getOAuth2User()))
                .enabled(Boolean.TRUE.equals(user.getEnabled()))
                .systemAdmin(Boolean.TRUE.equals(user.getSystemAdmin()))
                .build();
    }

    private AdminWorkspaceRowDTO toWorkspaceRow(Workspace workspace) {
        List<WorkspaceMember> owners = workspaceMemberRepository.findByWorkspaceAndRole(
                workspace, WorkspaceRole.OWNER);
        String ownerEmail = owners.isEmpty()
                ? null
                : owners.get(0).getUser().getEmail();
        return AdminWorkspaceRowDTO.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .slug(workspace.getSlug())
                .ownerEmail(ownerEmail)
                .memberCount(workspaceMemberRepository.countByWorkspace(workspace))
                .createdAt(workspace.getCreatedAt())
                .build();
    }

    private <E, D> PagedResponseDTO<D> toPagedResponse(Page<E> page, java.util.function.Function<E, D> mapper) {
        return PagedResponseDTO.<D>builder()
                .content(page.getContent().stream().map(mapper).toList())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .page(page.getNumber())
                .size(page.getSize())
                .build();
    }
}
