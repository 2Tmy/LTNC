package com.company.complaints.repository;

import com.company.complaints.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
            SELECT COUNT(u)
            FROM User u
            WHERE u.role = com.company.complaints.enums.Role.CUSTOMER
            AND u.enabled = true
            """)
    Long countActiveCustomers();

    @Query("""
            SELECT COUNT(u)
            FROM User u
            WHERE u.role = com.company.complaints.enums.Role.CUSTOMER
            """)
    Long countTotalCustomers();

    @Query("""
            SELECT COUNT(DISTINCT c.customer)
            FROM Complaint c
            WHERE c.customer.role = com.company.complaints.enums.Role.CUSTOMER
            """)
    Long countCustomersWithComplaints();

    @Query(value = """
            SELECT EXTRACT(YEAR FROM created_at)::int  AS year,
                   EXTRACT(MONTH FROM created_at)::int AS month,
                   COUNT(*)::bigint                    AS cnt
            FROM users
            WHERE role = 'CUSTOMER'
              AND created_at >= :fromDate
            GROUP BY 1, 2
            ORDER BY 1, 2
            """, nativeQuery = true)
    List<Object[]> monthlyNewCustomers(@Param("fromDate") LocalDateTime fromDate);
}
