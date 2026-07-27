package com.leccionario.backend.finance;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinancialDiscountServiceTest {

    @Mock
    private FinancialDiscountRepository repository;

    @InjectMocks
    private FinancialDiscountService financialDiscountService;

    @Test
    void findAll_delegatesToRepository() {
        FinancialDiscount d = new FinancialDiscount();
        when(repository.findByInstitutionIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(d));

        List<FinancialDiscount> result = financialDiscountService.findAll(1L);

        assertEquals(1, result.size());
    }

    @Test
    void findActive_filtersByStatus() {
        when(repository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(1L, "ACTIVO")).thenReturn(List.of());

        List<FinancialDiscount> result = financialDiscountService.findActive(1L);

        assertTrue(result.isEmpty());
    }

    @Test
    void findByStudent_delegatesToRepository() {
        FinancialDiscount d = new FinancialDiscount();
        when(repository.findByStudentIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(d));

        List<FinancialDiscount> result = financialDiscountService.findByStudent(10L);

        assertEquals(1, result.size());
    }

    @Test
    void save_delegatesToRepository() {
        FinancialDiscount d = new FinancialDiscount();
        when(repository.save(d)).thenReturn(d);

        FinancialDiscount saved = financialDiscountService.save(d);

        assertSame(d, saved);
    }

    @Test
    void delete_callsRepository() {
        financialDiscountService.delete(1L);
        verify(repository).deleteById(1L);
    }
}
