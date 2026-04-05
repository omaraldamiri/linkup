package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember,String> {
}
