package com.company.complaints.repository;

import com.company.complaints.entity.Complaint;
import com.company.complaints.entity.User;
import com.company.complaints.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByCustomerOrderByCreatedAtDesc(User customer);

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findAllByOrderByCreatedAtDesc();
    
    Optional<Complaint> findByComplaintCode(String complaintCode);

    Optional<Complaint> findTopByOrderByIdDesc();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countGroupByCategory();

    @Query(value = """
            SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400.0)
            FROM complaints
            WHERE status = 'RESOLVED'
            AND resolved_at IS NOT NULL
            """, nativeQuery = true)
    Double findAvgResolutionDays();

    @Query("""
            SELECT COUNT(c)
            FROM Complaint c
            WHERE c.status <> com.company.complaints.enums.ComplaintStatus.RESOLVED
            AND c.createdAt < :cutoffDate
            """)
    Long countSlaBreached(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("""
            SELECT COUNT(c)
            FROM Complaint c
            WHERE c.status <> com.company.complaints.enums.ComplaintStatus.RESOLVED
            AND c.createdAt BETWEEN :warningStart AND :warningEnd
            """)
    Long countSlaWarning(@Param("warningStart") LocalDateTime warningStart,
                         @Param("warningEnd") LocalDateTime warningEnd);

    @Query("""
            SELECT COUNT(c)
            FROM Complaint c
            WHERE c.status = com.company.complaints.enums.ComplaintStatus.RESOLVED
            """)
    Long countResolvedTotal();

    @Query("""
            SELECT COUNT(DISTINCT v.complaint)
            FROM ComplaintValidation v
            WHERE v.complaint.status = com.company.complaints.enums.ComplaintStatus.RESOLVED
            AND v.validationStatus = com.company.complaints.enums.ValidationStatus.INVALID
            """)
    Long countRejectedResolved();

    @Query(value = """
            SELECT EXTRACT(YEAR FROM created_at)::int  AS year,
                   EXTRACT(MONTH FROM created_at)::int AS month,
                   category,
                   COUNT(*)::bigint                    AS cnt
            FROM complaints
            WHERE created_at >= :fromDate
            GROUP BY 1, 2, 3
            ORDER BY 1, 2, 3
            """, nativeQuery = true)
    List<Object[]> monthlyStatsByCategory(@Param("fromDate") LocalDateTime fromDate);

    @Query(value = """
            SELECT EXTRACT(YEAR FROM created_at)::int   AS year,
                   EXTRACT(MONTH FROM created_at)::int  AS month,
                   AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400.0) AS avg_days
            FROM complaints
            WHERE created_at >= :fromDate
              AND resolved_at IS NOT NULL
              AND status = 'RESOLVED'
            GROUP BY 1, 2
            ORDER BY 1, 2
            """, nativeQuery = true)
    List<Object[]> monthlyAvgResolutionDays(@Param("fromDate") LocalDateTime fromDate);

    @Query(value = """
            SELECT EXTRACT(YEAR FROM created_at)::int  AS year,
                   EXTRACT(MONTH FROM created_at)::int AS month,
                   COUNT(*)::bigint                    AS breach_count
            FROM complaints
            WHERE created_at >= :fromDate
              AND status <> 'RESOLVED'
              AND created_at < :cutoffDate
            GROUP BY 1, 2
            ORDER BY 1, 2
            """, nativeQuery = true)
    List<Object[]> monthlySlaBreachCount(@Param("fromDate") LocalDateTime fromDate,
                                         @Param("cutoffDate") LocalDateTime cutoffDate);
}
