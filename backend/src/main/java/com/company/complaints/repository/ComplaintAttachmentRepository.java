package com.company.complaints.repository;

import com.company.complaints.entity.ComplaintAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintAttachmentRepository extends JpaRepository<ComplaintAttachment, Long> {
    List<ComplaintAttachment> findByComplaintId(Long complaintId);
    List<ComplaintAttachment> findByComplaintIdAndIsEvidenceTrue(Long complaintId);
    List<ComplaintAttachment> findByComplaintIdAndIsEvidenceFalse(Long complaintId);
    List<ComplaintAttachment> findByUploadedById(Long userId);


}