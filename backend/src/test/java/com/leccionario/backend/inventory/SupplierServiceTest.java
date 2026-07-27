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
class SupplierServiceTest {

    @Mock
    private SupplierRepository repository;

    @InjectMocks
    private SupplierService supplierService;

    @Test
    void findAll_delegatesToRepository() {
        Supplier s = new Supplier();
        when(repository.findByInstitutionIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(s));

        List<Supplier> result = supplierService.findAll(1L);

        assertEquals(1, result.size());
        verify(repository).findByInstitutionIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void findActive_filtersByStatus() {
        when(repository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(1L, "ACTIVO")).thenReturn(List.of());

        List<Supplier> result = supplierService.findActive(1L);

        assertTrue(result.isEmpty());
        verify(repository).findByInstitutionIdAndStatusOrderByCreatedAtDesc(1L, "ACTIVO");
    }

    @Test
    void save_delegatesToRepository() {
        Supplier s = new Supplier();
        when(repository.save(s)).thenReturn(s);

        Supplier saved = supplierService.save(s);

        assertSame(s, saved);
        verify(repository).save(s);
    }

    @Test
    void delete_callsRepository() {
        supplierService.delete(1L);
        verify(repository).deleteById(1L);
    }
}
