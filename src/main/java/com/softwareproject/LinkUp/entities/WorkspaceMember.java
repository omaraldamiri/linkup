package com.softwareproject.LinkUp.entities;

import com.softwareproject.LinkUp.enums.WorkspaceRole;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Table(name="workspace_members")
@Entity
@Builder
@Setter
@Getter
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkspaceRole role;
    @CreatedDate
    @Column(updatable = false,nullable = false)
    private LocalDateTime createdAt;
    //many to many relation ship between users and workspace
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    //many to many reletaionship between workspace nad users
    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;


}
