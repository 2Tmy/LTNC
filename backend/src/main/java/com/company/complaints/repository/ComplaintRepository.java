package com.company.complaints.repository;

import com.company.complaints.entity.Complaint;
import com.company.complaints.entity.User;
import com.company.complaints.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByCustomerOrderByCreatedAtDesc(User customer);

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    Optional<Complaint> findByComplaintCode(String complaintCode);

    Optional<Complaint> findTopByOrderByIdDesc();
}