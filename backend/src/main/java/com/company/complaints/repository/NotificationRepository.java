package com.company.complaints.repository;

import com.company.complaints.entity.Notification;
import com.company.complaints.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository cho Notification
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Lấy tất cả notifications của 1 user (sắp xếp mới nhất trước)
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Lấy notifications chưa đọc của 1 user
     */
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    /**
     * Lấy notifications đã đọc của 1 user
     */
    List<Notification> findByUserIdAndIsReadTrueOrderByCreatedAtDesc(Long userId);
    
    /**
     * Lấy notifications của 1 complaint
     */
    List<Notification> findByComplaintIdOrderByCreatedAtDesc(Long complaintId);
    
    /**
     * Lấy notifications theo type
     */
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type);
    
    /**
     * Đếm số notifications chưa đọc
     */
    Long countByUserIdAndIsReadFalse(Long userId);
    
    /**
     * Đánh dấu tất cả notifications của user là đã đọc
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt " +
           "WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);
    
    /**
     * Đánh dấu notifications của 1 complaint là đã đọc
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt " +
           "WHERE n.complaint.id = :complaintId AND n.user.id = :userId AND n.isRead = false")
    int markComplaintNotificationsAsRead(
        @Param("complaintId") Long complaintId, 
        @Param("userId") Long userId,
        @Param("readAt") LocalDateTime readAt
    );
    
    /**
     * Xóa notifications cũ hơn N ngày
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate AND n.isRead = true")
    int deleteOldReadNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Lấy notifications gần đây (7 ngày)
     */
    @Query("SELECT n FROM Notification n " +
           "WHERE n.user.id = :userId " +
           "AND n.createdAt >= :sevenDaysAgo " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(
        @Param("userId") Long userId, 
        @Param("sevenDaysAgo") LocalDateTime sevenDaysAgo
    );
}