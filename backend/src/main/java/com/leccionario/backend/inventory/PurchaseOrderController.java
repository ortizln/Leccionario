package com.leccionario.backend.inventory;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory/purchase-orders")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {
    private final PurchaseOrderService service;
    public PurchaseOrderController(PurchaseOrderService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseOrder>> findByStatus(@RequestParam Long institutionId, @PathVariable String status) {
        return ResponseEntity.ok(service.findByStatus(institutionId, status));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrder> save(@RequestBody PurchaseOrder order) {
        return ResponseEntity.ok(service.save(order));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PurchaseOrder> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
