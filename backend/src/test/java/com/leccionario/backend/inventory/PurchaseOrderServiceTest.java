package com.leccionario.backend.inventory;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderServiceTest {

    @Mock
    private PurchaseOrderRepository repository;

    @InjectMocks
    private PurchaseOrderService purchaseOrderService;

    @Test
    void save_generatesOrderNumber_whenNull() {
        PurchaseOrder order = new PurchaseOrder();
        order.setOrderNumber(null);

        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PurchaseOrder saved = purchaseOrderService.save(order);

        assertNotNull(saved.getOrderNumber());
        assertTrue(saved.getOrderNumber().startsWith("OC-"));
        verify(repository).save(order);
    }

    @Test
    void save_keepsOrderNumber_whenProvided() {
        PurchaseOrder order = new PurchaseOrder();
        order.setOrderNumber("OC-EXISTING");

        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PurchaseOrder saved = purchaseOrderService.save(order);

        assertEquals("OC-EXISTING", saved.getOrderNumber());
    }

    @Test
    void updateStatus_throwsWhenNotFound() {
        when(repository.findById(999L)).thenReturn(java.util.Optional.empty());

        assertThrows(RuntimeException.class, () -> purchaseOrderService.updateStatus(999L, "APROBADA"));
    }

    @Test
    void updateStatus_updatesAndSaves() {
        PurchaseOrder order = new PurchaseOrder();
        order.setStatus("PENDIENTE");

        when(repository.findById(1L)).thenReturn(java.util.Optional.of(order));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PurchaseOrder updated = purchaseOrderService.updateStatus(1L, "RECIBIDA");

        assertEquals("RECIBIDA", updated.getStatus());
        verify(repository).save(order);
    }

    @Test
    void delete_callsRepository() {
        purchaseOrderService.delete(1L);
        verify(repository).deleteById(1L);
    }
}
