package com.leccionario.backend.studentmgmt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClubServiceTest {

    private ClubRepository clubRepo;
    private ClubMembershipRepository membershipRepo;
    private ClubService service;

    @BeforeEach
    void setUp() {
        clubRepo = mock(ClubRepository.class);
        membershipRepo = mock(ClubMembershipRepository.class);
        service = new ClubService(clubRepo, membershipRepo);
    }

    @Test
    void create_savesClub() {
        Club club = new Club();
        club.setName("Ajedrez");
        when(clubRepo.save(any())).thenAnswer(inv -> {
            Club c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });
        Club result = service.create(club);
        assertEquals("Ajedrez", result.getName());
    }

    @Test
    void findByInstitution_delegatesToRepository() {
        when(clubRepo.findByInstitutionIdAndActiveTrueOrderByName(1L)).thenReturn(List.of());
        List<Club> result = service.findByInstitution(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void update_modifiesClub() {
        Club existing = new Club();
        existing.setId(1L);
        existing.setName("Old");
        Club updates = new Club();
        updates.setName("New");
        updates.setDescription("Desc");
        when(clubRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(clubRepo.save(any())).thenReturn(existing);
        Club result = service.update(1L, updates);
        assertEquals("New", result.getName());
    }

    @Test
    void enroll_savesMembership() {
        ClubMembership m = new ClubMembership();
        when(membershipRepo.save(any())).thenReturn(m);
        ClubMembership result = service.enroll(m);
        assertNotNull(result);
    }

    @Test
    void getStats_returnsCount() {
        when(membershipRepo.countByClubIdAndStatus(1L, "ACTIVO")).thenReturn(15L);
        Map<String, Object> stats = service.getStats(1L);
        assertEquals(15L, stats.get("members"));
    }
}
