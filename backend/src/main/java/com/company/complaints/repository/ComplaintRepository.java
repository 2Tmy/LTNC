package com.company.complaints.repository;

import com.company.complaints.entity.Complaint;
import com.company.complaints.entity.User;
import com.company.complaints.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByCustomerOrderByCreatedAtDesc(User customer);

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findAllByOrderByCreatedAtDesc();
}
