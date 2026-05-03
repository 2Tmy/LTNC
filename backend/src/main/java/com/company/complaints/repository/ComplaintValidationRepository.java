package com.company.complaints.repository;

import com.company.complaints.entity.ComplaintValidation;
import com.company.complaints.enums.ValidationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho ComplaintValidation
 */
@Repository
public interface ComplaintValidationRepository extends JpaRepository<ComplaintValidation, Long> {
    
    // Tìm validation record của 1 complaint
    Optional<ComplaintValidation> findByComplaintId(Long complaintId);
    
    
     //* Tìm tất cả validations của 1 CS_STAFF
    List<ComplaintValidation> findByValidatedById(Long validatedById);
    
    /**
     * Tìm validations theo status
     */
    List<ComplaintValidation> findByValidationStatus(ValidationStatus status);
    
    /**
     * Tìm validations trong khoảng thời gian
     */
    List<ComplaintValidation> findByValidatedAtBetween(
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    /**
     * Đếm số complaint được validate bởi 1 staff
     */
    @Query("SELECT COUNT(v) FROM ComplaintValidation v WHERE v.validatedBy.id = :staffId")
    Long countByStaffId(@Param("staffId") Long staffId);
    
    /**
     * Đếm số complaint VALID vs INVALID vs NEED_MORE_INFO
     */
    @Query("SELECT v.validationStatus, COUNT(v) FROM ComplaintValidation v GROUP BY v.validationStatus")
    List<Object[]> countByStatus();
    
    /**
     * Tìm validations cần review (NEED_MORE_INFO đã quá 7 ngày)
     */
    @Query("SELECT v FROM ComplaintValidation v " +
           "WHERE v.validationStatus = 'NEED_MORE_INFO' " +
           "AND v.validatedAt < :sevenDaysAgo")
    List<ComplaintValidation> findStaleNeedMoreInfo(@Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);
    
    /**
     * Check xem complaint đã được validate chưa
     */
    boolean existsByComplaintId(Long complaintId);
}