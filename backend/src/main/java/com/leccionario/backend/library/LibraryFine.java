package com.leccionario.backend.library;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "library_fines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryFine extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private BookLoan loan;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fineAmount;

    @Column(nullable = false)
    private Integer daysOverdue;

    @Column(length = 30)
    private String status = "PENDIENTE"; // PENDIENTE, PAGADA, CONDONADA

    private LocalDate paidDate;

    @Column(length = 200)
    private String reason;

    @Column(nullable = false)
    private Long institutionId;
}