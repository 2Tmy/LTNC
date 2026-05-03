package com.company.complaints.entity;

import com.company.complaints.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * User entity - Đại diện cho tài khoản người dùng
 * 
 * 4 roles:
 * - CUSTOMER: Khách hàng gửi khiếu nại
 * - CS_STAFF: Nhân viên tiếp nhận và validate
 * - SPECIALIST: Chuyên viên điều tra
 * - MANAGEMENT: Quản lý phê duyệt
 * 
 * Implements UserDetails để tích hợp Spring Security
 */
@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_email", columnList = "email"),  // Email query nhiều
        @Index(name = "idx_role", columnList = "role"),    // Filter by role
        @Index(name = "idx_role_enabled", columnList = "role, enabled")  // Active users by role
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
    
    // ==================== PRIMARY KEY ====================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ==================== BASIC INFO ====================
    @Column(nullable = false, length = 255)
    private String name;  // Tên đầy đủ
    
    @Column(nullable = false, unique = true, length = 255)
    private String email;  // Email login (unique)
    
    @Column(nullable = false, length = 255)
    private String password;  // BCrypt hash
    
    // ==================== ROLE & STATUS ====================
    @Enumerated(EnumType.STRING)  // Lưu "CUSTOMER", không phải số
    @Column(nullable = false, length = 50)
    private Role role;
    
    @Column(nullable = false)
    @Builder.Default  // Default value khi dùng Builder
    private Boolean enabled = true;  // Active account?
    
    // ==================== TIMESTAMPS ====================
    @CreationTimestamp  // Auto-set khi INSERT
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp  // Auto-update mỗi lần UPDATE
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // ==================== RELATIONSHIPS ====================
    // Note: Không define @OneToMany ở đây để tránh lazy loading issues
    // Nếu cần, query từ repository: complaintRepository.findByCustomerId(userId)
    
    // ==================== SPRING SECURITY METHODS ====================
    // Implement UserDetails interface
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convert role thành GrantedAuthority
        return List.of(new SimpleGrantedAuthority(role.name()));
    }
    
    @Override
    public String getUsername() {
        return email;  // Email là username
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;  // Account không bao giờ expire
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;  // Account không bị lock
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;  // Password không expire
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;  // Dùng enabled flag
    }
    
    // ==================== HELPER METHODS ====================
    
    /**
     * Check xem user có phải CUSTOMER không
     */
    public boolean isCustomer() {
        return role == Role.CUSTOMER;
    }
    
    /**
     * Check xem user có phải STAFF không (CS_STAFF, SPECIALIST, MANAGEMENT)
     */
    public boolean isStaff() {
        return role != Role.CUSTOMER;
    }
    
    /**
     * Check xem user có quyền validate không (CS_STAFF hoặc MANAGEMENT)
     */
    public boolean canValidate() {
        return role == Role.CS_STAFF || role == Role.MANAGEMENT;
    }
    
    /**
     * Check xem user có quyền assign không (CS_STAFF hoặc MANAGEMENT)
     */
    public boolean canAssign() {
        return role == Role.CS_STAFF || role == Role.MANAGEMENT;
    }
}