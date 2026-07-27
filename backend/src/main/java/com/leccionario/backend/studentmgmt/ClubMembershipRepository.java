package com.leccionario.backend.studentmgmt;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {
    List<ClubMembership> findByClubIdAndStatus(Long clubId, String status);
    List<ClubMembership> findByStudentIdAndStatus(Long studentId, String status);
    long countByClubIdAndStatus(Long clubId, String status);
}
