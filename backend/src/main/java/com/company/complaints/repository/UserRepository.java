package com.company.complaints.repository;

import com.company.complaints.entity.User;
import com.company.complaints.enums.Role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByRoleAndEnabledTrue(Role role); //Tìm active users theo role

    Optional<User> findByEmailAndEnabledTrue(String email);

    // ==================== CUSTOM QUERIES ====================
    
    /**
     * Đếm số user theo role
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") Role role);
    
    /**
     * Lấy tất cả CS_STAFF (để assign complaints)
     */
    @Query("SELECT u FROM User u WHERE u.role = 'CS_STAFF' AND u.enabled = true")
    List<User> findAllActiveCSStaff();
    
    /**
     * Lấy tất cả SPECIALIST (để assign complaints)
     */
    @Query("SELECT u FROM User u WHERE u.role = 'SPECIALIST' AND u.enabled = true")
    List<User> findAllActiveSpecialists();
}


