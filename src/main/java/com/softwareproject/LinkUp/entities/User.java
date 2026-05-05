package com.softwareproject.LinkUp.entities;


import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name="users")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy= GenerationType.UUID)
    @Column(length = 36)
    private String id;
    @Column(unique = true,nullable = true)
    private String googleId;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false , unique = true)
    private String email;
    @Column(nullable = true)
    private String password;
    @Lob
    @Column(columnDefinition = "MEDIUMTEXT")
    private String image;
    @Column(nullable = false)
    private Boolean oAuth2User = false;
    @CreatedDate
    @Column(updatable = false , nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    @OneToMany(mappedBy = "user" , cascade = CascadeType.REMOVE ,orphanRemoval = true)
    private List<WorkspaceMember> workspaceMemberList=new ArrayList<>();

    @OneToMany(mappedBy = "user" , cascade = CascadeType.REMOVE , orphanRemoval = true)
    private List<ProjectMember> projectMemberlist=new ArrayList<>();

    @OneToMany(mappedBy = "assignee" , cascade = CascadeType.REMOVE , orphanRemoval = true)
    private List<Task> taskList=new ArrayList<>();

    @OneToMany(mappedBy = "user" , cascade = CascadeType.REMOVE , orphanRemoval = true)
    private List<Comment> commentList=new ArrayList<>();


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public  String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
