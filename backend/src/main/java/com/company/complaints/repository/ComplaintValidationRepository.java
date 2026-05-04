package com.company.complaints.repository;

import com.company.complaints.entity.ComplaintValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintValidationRepository extends JpaRepository<ComplaintValidation, Long> {

    Optional<ComplaintValidation> findByComplaintId(Long complaintId);
}
