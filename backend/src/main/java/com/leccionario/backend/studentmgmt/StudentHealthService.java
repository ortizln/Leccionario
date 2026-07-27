package com.leccionario.backend.studentmgmt;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentHealthService {

    private final StudentHealthRecordRepository healthRepo;
    private final StudentVaccinationRepository vaccinationRepo;

    public StudentHealthService(StudentHealthRecordRepository healthRepo, StudentVaccinationRepository vaccinationRepo) {
        this.healthRepo = healthRepo;
        this.vaccinationRepo = vaccinationRepo;
    }

    public StudentHealthRecord saveHealthRecord(StudentHealthRecord record) {
        return healthRepo.save(record);
    }

    public StudentHealthRecord getHealthRecord(Long studentId) {
        return healthRepo.findByStudentId(studentId).orElse(null);
    }

    public void deleteHealthRecord(Long id) { healthRepo.deleteById(id); }

    public StudentVaccination addVaccination(StudentVaccination v) { return vaccinationRepo.save(v); }

    public List<StudentVaccination> getVaccinations(Long studentId) {
        return vaccinationRepo.findByStudentIdOrderByDoseDateDesc(studentId);
    }

    public void deleteVaccination(Long id) { vaccinationRepo.deleteById(id); }
}
