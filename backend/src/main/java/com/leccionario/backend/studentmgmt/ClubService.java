package com.leccionario.backend.studentmgmt;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClubService {

    private final ClubRepository clubRepo;
    private final ClubMembershipRepository membershipRepo;

    public ClubService(ClubRepository clubRepo, ClubMembershipRepository membershipRepo) {
        this.clubRepo = clubRepo;
        this.membershipRepo = membershipRepo;
    }

    public Club create(Club club) { return clubRepo.save(club); }
    public Club update(Long id, Club updates) {
        Club c = clubRepo.findById(id).orElseThrow(() -> new RuntimeException("Club no encontrado"));
        c.setName(updates.getName()); c.setDescription(updates.getDescription());
        c.setClubType(updates.getClubType()); c.setCoordinator(updates.getCoordinator());
        c.setScheduleInfo(updates.getScheduleInfo()); c.setMaxMembers(updates.getMaxMembers());
        c.setActive(updates.getActive());
        return clubRepo.save(c);
    }
    public void delete(Long id) { clubRepo.deleteById(id); }
    public List<Club> findByInstitution(Long institutionId) { return clubRepo.findByInstitutionIdAndActiveTrueOrderByName(institutionId); }
    public List<Club> findAllByInstitution(Long institutionId) { return clubRepo.findByInstitutionIdOrderByName(institutionId); }

    public ClubMembership enroll(ClubMembership m) { return membershipRepo.save(m); }
    public void unenroll(Long id) { membershipRepo.deleteById(id); }
    public List<ClubMembership> findMembers(Long clubId) { return membershipRepo.findByClubIdAndStatus(clubId, "ACTIVO"); }
    public List<ClubMembership> findStudentClubs(Long studentId) { return membershipRepo.findByStudentIdAndStatus(studentId, "ACTIVO"); }

    public Map<String, Object> getStats(Long clubId) {
        long members = membershipRepo.countByClubIdAndStatus(clubId, "ACTIVO");
        return Map.of("members", members);
    }
}
