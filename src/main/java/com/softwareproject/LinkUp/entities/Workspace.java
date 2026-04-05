package com.softwareproject.LinkUp.entities;


import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(name="workspaces")
public class Workspace {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;
    @Column(nullable = false,unique = true)
    private String name;
    @Column(nullable = false,unique = true)
    private String slug;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(length = 500)
    private String imageUrl;
    @CreatedDate
    @Column(updatable = false , nullable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    //users relationship many to many and workspace
    @OneToMany(mappedBy = "workspace",cascade = CascadeType.REMOVE , orphanRemoval = true)
    private List<WorkspaceMember> workspaceMemberList=new ArrayList<>();

    //projects relation ship one to many from workspace->project
    @OneToMany(mappedBy="workspace" , cascade = CascadeType.REMOVE , orphanRemoval = true)
    private List<Project> projectList=new ArrayList<>();

}
