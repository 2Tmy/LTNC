package com.company.complaints.repository;

import com.company.complaints.entity.ComplaintHistory;
import com.company.complaints.enums.ActionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository cho ComplaintHistory (Unified History)
 */
@Repository
public interface ComplaintHistoryRepository extends JpaRepository<ComplaintHistory, Long> {
    
    /**
     * Lấy full timeline của 1 complaint (tất cả actions)
     */
    List<ComplaintHistory> findByComplaintIdOrderByChangedAtAsc(Long complaintId);
    
    /**
     * Lấy histories theo action type
     * VD: Chỉ xem INFO_UPDATED hoặc chỉ xem FILE_UPLOADED
     */
    List<ComplaintHistory> findByComplaintIdAndActionTypeOrderByChangedAtAsc(
        Long complaintId, 
        ActionType actionType
    );
    
    /**
     * Get status changes only (giống old statusHistory)
     */
    @Query("SELECT h FROM ComplaintHistory h " +
           "WHERE h.complaint.id = :complaintId " +
           "AND h.actionType = 'STATUS_CHANGED' " +
           "ORDER BY h.changedAt ASC")
    List<ComplaintHistory> findStatusChangesByComplaintId(@Param("complaintId") Long complaintId);
    
    /**
     * Get description changes (để xem customer đã sửa như thế nào)
     */
    @Query("SELECT h FROM ComplaintHistory h " +
           "WHERE h.complaint.id = :complaintId " +
           "AND h.actionType = 'INFO_UPDATED' " +
           "ORDER BY h.changedAt ASC")
    List<ComplaintHistory> findDescriptionChangesByComplaintId(@Param("complaintId") Long complaintId);
    
    /**
     * Get file changes
     */
    @Query("SELECT h FROM ComplaintHistory h " +
           "WHERE h.complaint.id = :complaintId " +
           "AND h.actionType IN ('FILE_UPLOADED', 'FILE_DELETED') " +
           "ORDER BY h.changedAt ASC")
    List<ComplaintHistory> findFileChangesByComplaintId(@Param("complaintId") Long complaintId);
    
    /**
     * Đếm số changes của 1 complaint
     */
    Long countByComplaintId(Long complaintId);
    
    /**
     * Get histories by user
     */
    List<ComplaintHistory> findByChangedByIdOrderByChangedAtDesc(Long userId);
    
    /**
     * Get histories trong khoảng thời gian
     */
    List<ComplaintHistory> findByChangedAtBetween(
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
}