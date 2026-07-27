package com.leccionario.backend.inventory;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "asset_warranties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetWarranty extends BaseEntity {
    @Column(nullable = false)
    private Long assetId;

    @Column(nullable = false, length = 200)
    private String provider;

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(length = 50)
    private String warrantyType = "ESTANDAR";

    @Column(columnDefinition = "TEXT")
    private String terms;

    @Column(length = 20)
    private String status = "VIGENTE";

    @Column(nullable = false)
    private Long institutionId;
}
