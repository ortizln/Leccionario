package com.leccionario.backend.finance;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TuitionPlanServiceTest {

    @Mock
    private TuitionPlanRepository tuitionPlanRepository;

    @InjectMocks
    private TuitionPlanService tuitionPlanService;

    @Test
    void create_setsFieldsAndReturnsResponse() {
        when(tuitionPlanRepository.save(any())).thenAnswer(inv -> {
            TuitionPlan plan = inv.getArgument(0);
            plan.setId(1L);
            return plan;
        });

        TuitionPlanRequest req = new TuitionPlanRequest();
        req.institutionId = 1L;
        req.name = "Matricula 2026";
        req.description = "Plan anual";
        req.amount = new BigDecimal("500.00");
        req.ivaIncluded = true;
        req.category = "MATRICULA";
        req.active = null;

        TuitionPlanResponse resp = tuitionPlanService.create(req);

        assertEquals("Matricula 2026", resp.name);
        assertEquals(new BigDecimal("500.00"), resp.amount);
        assertTrue(resp.active);
        assertTrue(resp.ivaIncluded);
    }

    @Test
    void create_usesFalse_whenActiveExplicitlySet() {
        when(tuitionPlanRepository.save(any())).thenAnswer(inv -> {
            TuitionPlan plan = inv.getArgument(0);
            plan.setId(1L);
            return plan;
        });

        TuitionPlanRequest req = new TuitionPlanRequest();
        req.institutionId = 1L;
        req.name = "Test";
        req.amount = BigDecimal.TEN;
        req.active = false;

        TuitionPlanResponse resp = tuitionPlanService.create(req);

        assertFalse(resp.active);
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(tuitionPlanRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> tuitionPlanService.findById(999L));
    }

    @Test
    void findById_returnsResponse() {
        TuitionPlan plan = new TuitionPlan();
        plan.setId(1L);
        plan.setName("Test Plan");
        plan.setAmount(new BigDecimal("200"));

        when(tuitionPlanRepository.findById(1L)).thenReturn(Optional.of(plan));

        TuitionPlanResponse resp = tuitionPlanService.findById(1L);

        assertEquals("Test Plan", resp.name);
        assertEquals(new BigDecimal("200"), resp.amount);
    }

    @Test
    void update_throwsWhenNotFound() {
        when(tuitionPlanRepository.findById(999L)).thenReturn(Optional.empty());

        TuitionPlanRequest req = new TuitionPlanRequest();
        assertThrows(RuntimeException.class, () -> tuitionPlanService.update(999L, req));
    }
}
