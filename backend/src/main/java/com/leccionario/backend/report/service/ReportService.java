package com.leccionario.backend.report.service;

import com.leccionario.backend.evaluation.repository.EvaluationRepository;
import com.leccionario.backend.lessonplan.repository.LessonPlanRepository;
import com.leccionario.backend.report.dto.DashboardMetricsResponse;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final LessonPlanRepository lessonPlanRepository;
    private final EvaluationRepository evaluationRepository;

    public DashboardMetricsResponse getDashboardMetrics() {
        return new DashboardMetricsResponse(
                userRepository.count(),
                teacherRepository.count(),
                studentRepository.count(),
                lessonPlanRepository.count(),
                evaluationRepository.count());
    }
}
