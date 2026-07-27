package com.leccionario.backend.studentmgmt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StudentHealthServiceTest {

    private StudentHealthRecordRepository healthRepo;
    private StudentVaccinationRepository vaccinationRepo;
    private StudentHealthService service;

    @BeforeEach
    void setUp() {
        healthRepo = mock(StudentHealthRecordRepository.class);
        vaccinationRepo = mock(StudentVaccinationRepository.class);
        service = new StudentHealthService(healthRepo, vaccinationRepo);
    }

    @Test
    void saveHealthRecord_savesAndReturns() {
        StudentHealthRecord record = new StudentHealthRecord();
        record.setStudentId(1L);
        when(healthRepo.save(record)).thenReturn(record);
        assertEquals(1L, service.saveHealthRecord(record).getStudentId());
    }

    @Test
    void getHealthRecord_found() {
        StudentHealthRecord record = new StudentHealthRecord();
        when(healthRepo.findByStudentId(1L)).thenReturn(Optional.of(record));
        assertNotNull(service.getHealthRecord(1L));
    }

    @Test
    void getHealthRecord_notFound_returnsNull() {
        when(healthRepo.findByStudentId(1L)).thenReturn(Optional.empty());
        assertNull(service.getHealthRecord(1L));
    }

    @Test
    void deleteHealthRecord_delegatesToRepository() {
        service.deleteHealthRecord(1L);
        verify(healthRepo).deleteById(1L);
    }

    @Test
    void addVaccination_savesAndReturns() {
        StudentVaccination v = new StudentVaccination();
        v.setStudentId(1L);
        when(vaccinationRepo.save(v)).thenReturn(v);
        assertEquals(1L, service.addVaccination(v).getStudentId());
    }

    @Test
    void getVaccinations_delegatesToRepository() {
        when(vaccinationRepo.findByStudentIdOrderByDoseDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.getVaccinations(1L).isEmpty());
    }

    @Test
    void deleteVaccination_delegatesToRepository() {
        service.deleteVaccination(1L);
        verify(vaccinationRepo).deleteById(1L);
    }
}
