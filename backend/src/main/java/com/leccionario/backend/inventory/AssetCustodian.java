package com.leccionario.backend.inventory;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "asset_custodians")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetCustodian extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private LocalDate assignedDate;

    private LocalDate returnedDate;

    @Column(length = 20)
    private String status = "ASIGNADO"; // ASIGNADO, DEVUELTO

    @Column(length = 300)
    private String observations;

    @Column(nullable = false)
    private Long institutionId;
}
