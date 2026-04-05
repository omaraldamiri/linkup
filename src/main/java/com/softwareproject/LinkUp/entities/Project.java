package com.softwareproject.LinkUp.entities;

import com.softwareproject.LinkUp.enums.ProjectPriority;
import com.softwareproject.LinkUp.enums.ProjectStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@EntityListeners(AuditingEntityListener.class)
@Entity
@Table(name="projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;
    @Column(nullable = false,unique = true)
    private String name;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectPriority projectPriority;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus projectStatus;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    @Column(nullable = false)
    private int progress;

    @CreatedDate
    @Column(updatable = false,nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // many to one releation ship between workspace -> project
    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @OneToMany(mappedBy = "project" ,cascade = CascadeType.REMOVE , orphanRemoval = true)
    private List<ProjectMember> projectMemberList=new ArrayList<>();

    @OneToMany(mappedBy = "project" , cascade = CascadeType.REMOVE , orphanRemoval = true)
    private List<Task> taskList=new ArrayList<>();

}
