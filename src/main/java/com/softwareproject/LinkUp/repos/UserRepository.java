package com.softwareproject.LinkUp.repos;

import com.softwareproject.LinkUp.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String id);

    long countByCreatedAtAfter(LocalDateTime after);

    @Query("""
            SELECT u FROM User u
            WHERE :q = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY u.createdAt DESC
            """)
    Page<User> searchUsers(@Param("q") String q, Pageable pageable);
}
