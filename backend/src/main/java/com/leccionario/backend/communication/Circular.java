package com.leccionario.backend.communication;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "circulars")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Circular extends BaseEntity {
    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(length = 50)
    private String category; // ACADEMICA, ADMINISTRATIVA, DISCIPLINARIA, GENERAL

    @Column(nullable = false)
    private LocalDate publishDate;

    @Column(length = 30)
    private String status = "PUBLICADA"; // BORRADOR, PUBLICADA, ARCHIVADA

    @Column(nullable = false)
    private Long institutionId;

    @Column(nullable = false)
    private Long authorUserId;

    private Boolean requiresAcknowledge = false;
}
