package com.leccionario.backend.questionbank.domain;

import com.leccionario.backend.academic.domain.Subject;
import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.institution.domain.Institution;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "questions")
public class Question extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private QuestionCategory category;

    @Column(name = "question_type", nullable = false, length = 20)
    private String questionType = "OPEN";

    @Column(nullable = false, length = 15)
    private String difficulty = "MEDIUM";

    @Column(name = "question_text", nullable = false, columnDefinition = "text")
    private String questionText;

    @Column(name = "correct_answer", columnDefinition = "text")
    private String correctAnswer;

    @Column(length = 500)
    private String optionA;

    @Column(length = 500)
    private String optionB;

    @Column(length = 500)
    private String optionC;

    @Column(length = 500)
    private String optionD;

    @Column(columnDefinition = "text")
    private String explanation;

    @Column(precision = 5, scale = 2)
    private BigDecimal points = BigDecimal.ONE;

    @Column(length = 300)
    private String tags;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(nullable = false)
    private Boolean active = true;
}
