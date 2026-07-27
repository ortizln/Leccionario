package com.leccionario.backend.inventory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SupplierService {
    private final SupplierRepository repository;

    public SupplierService(SupplierRepository repository) {
        this.repository = repository;
    }

    public List<Supplier> findAll(Long institutionId) {
        return repository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    public List<Supplier> findActive(Long institutionId) {
        return repository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(institutionId, "ACTIVO");
    }

    @Transactional
    public Supplier save(Supplier supplier) {
        return repository.save(supplier);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
