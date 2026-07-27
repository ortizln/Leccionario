package com.leccionario.backend.finance;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TuitionPlanService {

    private final TuitionPlanRepository tuitionPlanRepository;

    public TuitionPlanService(TuitionPlanRepository tuitionPlanRepository) {
        this.tuitionPlanRepository = tuitionPlanRepository;
    }

    public List<TuitionPlanResponse> findAll(Long institutionId) {
        return tuitionPlanRepository.findByInstitutionIdOrderByNameAsc(institutionId).stream()
                .map(this::toResponse).toList();
    }

    public List<TuitionPlanResponse> findActive(Long institutionId) {
        return tuitionPlanRepository.findByInstitutionIdAndActiveTrueOrderByNameAsc(institutionId).stream()
                .map(this::toResponse).toList();
    }

    public TuitionPlanResponse findById(Long id) {
        TuitionPlan plan = tuitionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tuition plan not found"));
        return toResponse(plan);
    }

    @Transactional
    public TuitionPlanResponse create(TuitionPlanRequest req) {
        TuitionPlan plan = new TuitionPlan();
        plan.setInstitutionId(req.institutionId);
        plan.setName(req.name);
        plan.setDescription(req.description);
        plan.setAmount(req.amount);
        plan.setIvaIncluded(req.ivaIncluded);
        plan.setCategory(req.category);
        plan.setActive(req.active != null ? req.active : true);
        return toResponse(tuitionPlanRepository.save(plan));
    }

    @Transactional
    public TuitionPlanResponse update(Long id, TuitionPlanRequest req) {
        TuitionPlan plan = tuitionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tuition plan not found"));
        plan.setName(req.name);
        plan.setDescription(req.description);
        plan.setAmount(req.amount);
        plan.setIvaIncluded(req.ivaIncluded);
        plan.setCategory(req.category);
        plan.setActive(req.active);
        return toResponse(tuitionPlanRepository.save(plan));
    }

    @Transactional
    public void delete(Long id) {
        tuitionPlanRepository.deleteById(id);
    }

    private TuitionPlanResponse toResponse(TuitionPlan plan) {
        TuitionPlanResponse resp = new TuitionPlanResponse();
        resp.id = plan.getId();
        resp.institutionId = plan.getInstitutionId();
        resp.name = plan.getName();
        resp.description = plan.getDescription();
        resp.amount = plan.getAmount();
        resp.ivaIncluded = plan.getIvaIncluded();
        resp.category = plan.getCategory();
        resp.active = plan.getActive();
        return resp;
    }
}
