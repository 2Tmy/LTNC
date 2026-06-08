package com.company.complaints.repository;

import com.company.complaints.entity.ComplaintFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintFeedbackRepository extends JpaRepository<ComplaintFeedback, Long> {

    Optional<ComplaintFeedback> findByComplaintId(Long complaintId);

    long countByRatingLessThanEqual(int rating);

    @Query("SELECT AVG(f.rating) FROM ComplaintFeedback f")
    Double findAverageRating();

    @Query("SELECT f.rating, COUNT(f) FROM ComplaintFeedback f GROUP BY f.rating ORDER BY f.rating")
    List<Object[]> countGroupByRating();
}
