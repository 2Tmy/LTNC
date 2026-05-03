package com.company.complaints.repository;

import com.company.complaints.entity.Complaint;
import com.company.complaints.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    // Tìm tất cả khiếu nại của 1 customer
    List<Complaint> findByCustomerId(Long customerId);
    
    // Tìm khiếu nại theo status
    List<Complaint> findByStatus(ComplaintStatus status);
    
    //Lấy complaints của 1 customer (sắp xếp mới nhất trước)
    List<Complaint> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    
    // Tìm khiếu nại được giao cho 1 manager
    List<Complaint> findByAssignedToId(Long managerId);
    List<Complaint> findByValidatedById(Long staffId);

    
    // Tìm khiếu nại theo customer và status
    List<Complaint> findByCustomerIdAndStatus(Long customerId, ComplaintStatus status);
    
    // Đếm số khiếu nại theo status (cho dashboard)
    Long countByStatus(ComplaintStatus status);
    


    // Query phức tạp hơn với JPQL
    @Query("SELECT c FROM Complaint c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:assignedToId IS NULL OR c.assignedTo.id = :assignedToId) " +
           "ORDER BY c.priority DESC, c.createdAt DESC")
    List<Complaint> findComplaintsWithFilters(
        @Param("status") ComplaintStatus status,
        @Param("assignedToId") Long assignedToId
    );
}