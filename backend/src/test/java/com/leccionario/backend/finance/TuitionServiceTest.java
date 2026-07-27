package com.leccionario.backend.finance;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TuitionServiceTest {

    private StudentTuitionRepository studentTuitionRepository;
    private TuitionPaymentRepository tuitionPaymentRepository;
    private TuitionPlanRepository tuitionPlanRepository;
    private TuitionService service;

    @BeforeEach
    void setUp() {
        studentTuitionRepository = mock(StudentTuitionRepository.class);
        tuitionPaymentRepository = mock(TuitionPaymentRepository.class);
        tuitionPlanRepository = mock(TuitionPlanRepository.class);
        service = new TuitionService(studentTuitionRepository, tuitionPaymentRepository, tuitionPlanRepository);
    }

    @Test
    void findByStudentAndPeriod_delegatesToRepository() {
        when(studentTuitionRepository.findByStudentIdAndPeriodIdOrderByStatusDesc(1L, 1L)).thenReturn(List.of());
        assertTrue(service.findByStudentAndPeriod(1L, 1L).isEmpty());
    }

    @Test
    void findByPeriod_delegatesToRepository() {
        when(studentTuitionRepository.findByPeriodIdOrderByStatusDesc(1L)).thenReturn(List.of());
        assertTrue(service.findByPeriod(1L).isEmpty());
    }

    @Test
    void getPayments_delegatesToRepository() {
        when(tuitionPaymentRepository.findByStudentTuitionIdOrderByPaymentDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.getPayments(1L).isEmpty());
    }

    @Test
    void assignPlan_savesAndReturns() {
        TuitionPlan plan = new TuitionPlan();
        plan.setId(1L);
        plan.setAmount(new BigDecimal("500.00"));
        when(tuitionPlanRepository.findById(1L)).thenReturn(Optional.of(plan));
        when(studentTuitionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = service.assignPlan(1L, 1L, 1L, 1L);
        assertNotNull(result);
        assertEquals(1L, result.studentId);
    }

    @Test
    void assignPlan_planNotFound_throws() {
        when(tuitionPlanRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.assignPlan(1L, 1L, 1L, 1L));
    }

    @Test
    void addPayment_savesAndReturns() {
        StudentTuition tuition = new StudentTuition();
        tuition.setId(1L);
        tuition.setTotalAmount(new BigDecimal("500.00"));
        tuition.setPaidAmount(BigDecimal.ZERO);
        when(studentTuitionRepository.findById(1L)).thenReturn(Optional.of(tuition));
        when(studentTuitionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(tuitionPaymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = service.addPayment(1L, new BigDecimal("100.00"), "EFECTIVO", "Nota");
        assertNotNull(result);
    }

    @Test
    void addPayment_tuitionNotFound_throws() {
        when(studentTuitionRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.addPayment(1L, new BigDecimal("100.00"), "EFECTIVO", null));
    }

    @Test
    void addPayment_marksCompleteWhenFullyPaid() {
        StudentTuition tuition = new StudentTuition();
        tuition.setId(1L);
        tuition.setTotalAmount(new BigDecimal("100.00"));
        tuition.setPaidAmount(new BigDecimal("90.00"));
        when(studentTuitionRepository.findById(1L)).thenReturn(Optional.of(tuition));
        when(studentTuitionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(tuitionPaymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.addPayment(1L, new BigDecimal("10.00"), "EFECTIVO", null);
        verify(studentTuitionRepository).save(argThat(st -> "PAGADA".equals(st.getStatus())));
    }
}
