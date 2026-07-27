package com.leccionario.backend.finance;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class TuitionService {

    private final StudentTuitionRepository studentTuitionRepository;
    private final TuitionPaymentRepository tuitionPaymentRepository;
    private final TuitionPlanRepository tuitionPlanRepository;

    public TuitionService(StudentTuitionRepository studentTuitionRepository, TuitionPaymentRepository tuitionPaymentRepository, TuitionPlanRepository tuitionPlanRepository) {
        this.studentTuitionRepository = studentTuitionRepository;
        this.tuitionPaymentRepository = tuitionPaymentRepository;
        this.tuitionPlanRepository = tuitionPlanRepository;
    }

    public List<StudentTuitionResponse> findByStudentAndPeriod(Long studentId, Long periodId) {
        return studentTuitionRepository.findByStudentIdAndPeriodIdOrderByStatusDesc(studentId, periodId).stream()
                .map(this::toResponse).toList();
    }

    public List<StudentTuitionResponse> findByPeriod(Long periodId) {
        return studentTuitionRepository.findByPeriodIdOrderByStatusDesc(periodId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public StudentTuitionResponse assignPlan(Long studentId, Long planId, Long periodId, Long enrollmentId) {
        TuitionPlan plan = tuitionPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Tuition plan not found"));
        StudentTuition st = new StudentTuition();
        st.setStudentId(studentId);
        st.setPlanId(planId);
        st.setPeriodId(periodId);
        st.setEnrollmentId(enrollmentId);
        st.setTotalAmount(plan.getAmount());
        st.setStatus("ACTIVA");
        return toResponse(studentTuitionRepository.save(st));
    }

    @Transactional
    public TuitionPaymentResponse addPayment(Long studentTuitionId, BigDecimal amount, String paymentMethod, String notes) {
        StudentTuition st = studentTuitionRepository.findById(studentTuitionId)
                .orElseThrow(() -> new RuntimeException("Student tuition not found"));
        TuitionPayment payment = new TuitionPayment();
        payment.setStudentTuitionId(studentTuitionId);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setNotes(notes);
        TuitionPayment saved = tuitionPaymentRepository.save(payment);
        BigDecimal newPaid = st.getPaidAmount().add(amount);
        st.setPaidAmount(newPaid);
        if (newPaid.compareTo(st.getTotalAmount()) >= 0) {
            st.setStatus("PAGADA");
        }
        studentTuitionRepository.save(st);
        TuitionPaymentResponse resp = new TuitionPaymentResponse();
        resp.id = saved.getId();
        resp.studentTuitionId = saved.getStudentTuitionId();
        resp.paymentDate = saved.getPaymentDate();
        resp.amount = saved.getAmount();
        resp.paymentMethod = saved.getPaymentMethod();
        resp.notes = saved.getNotes();
        return resp;
    }

    public List<TuitionPaymentResponse> getPayments(Long studentTuitionId) {
        return tuitionPaymentRepository.findByStudentTuitionIdOrderByPaymentDateDesc(studentTuitionId).stream()
                .map(p -> {
                    TuitionPaymentResponse resp = new TuitionPaymentResponse();
                    resp.id = p.getId();
                    resp.studentTuitionId = p.getStudentTuitionId();
                    resp.paymentDate = p.getPaymentDate();
                    resp.amount = p.getAmount();
                    resp.paymentMethod = p.getPaymentMethod();
                    resp.reference = p.getReference();
                    resp.notes = p.getNotes();
                    return resp;
                }).toList();
    }

    private StudentTuitionResponse toResponse(StudentTuition st) {
        StudentTuitionResponse resp = new StudentTuitionResponse();
        resp.id = st.getId();
        resp.studentId = st.getStudentId();
        resp.planId = st.getPlanId();
        resp.periodId = st.getPeriodId();
        resp.enrollmentId = st.getEnrollmentId();
        resp.totalAmount = st.getTotalAmount();
        resp.paidAmount = st.getPaidAmount();
        resp.status = st.getStatus();
        return resp;
    }
}
