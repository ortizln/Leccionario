package com.leccionario.backend.inventory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class AssetCustodianService {
    private final AssetCustodianRepository repository;
    private final AssetRepository assetRepository;

    public AssetCustodianService(AssetCustodianRepository repository, AssetRepository assetRepository) {
        this.repository = repository;
        this.assetRepository = assetRepository;
    }

    public List<AssetCustodian> findAll(Long institutionId) {
        return repository.findByInstitutionIdOrderByAssignedDateDesc(institutionId);
    }

    public List<AssetCustodian> findByEmployee(Long employeeId) {
        return repository.findByEmployeeIdAndStatusOrderByAssignedDateDesc(employeeId, "ASIGNADO");
    }

    @Transactional
    public AssetCustodian assign(AssetCustodian custodian) {
        Asset asset = assetRepository.findById(custodian.getAsset().getId())
                .orElseThrow(() -> new RuntimeException("Activo no encontrado"));
        custodian.setAsset(asset);
        custodian.setAssignedDate(LocalDate.now());
        custodian.setStatus("ASIGNADO");
        return repository.save(custodian);
    }

    @Transactional
    public AssetCustodian returnAsset(Long id) {
        AssetCustodian c = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asignacion no encontrada"));
        c.setReturnedDate(LocalDate.now());
        c.setStatus("DEVUELTO");
        return repository.save(c);
    }

    @Transactional
    public void delete(Long id) { repository.deleteById(id); }
}
