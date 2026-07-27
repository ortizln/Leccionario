package com.leccionario.backend.inventory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PurchaseOrderService {
    private final PurchaseOrderRepository repository;

    public PurchaseOrderService(PurchaseOrderRepository repository) { this.repository = repository; }

    public List<PurchaseOrder> findAll(Long institutionId) {
        return repository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    public List<PurchaseOrder> findByStatus(Long institutionId, String status) {
        return repository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(institutionId, status);
    }

    @Transactional
    public PurchaseOrder save(PurchaseOrder order) {
        if (order.getOrderNumber() == null) {
            order.setOrderNumber("OC-" + System.currentTimeMillis());
        }
        return repository.save(order);
    }

    @Transactional
    public PurchaseOrder updateStatus(Long id, String status) {
        PurchaseOrder order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        order.setStatus(status);
        return repository.save(order);
    }

    @Transactional
    public void delete(Long id) { repository.deleteById(id); }
}
