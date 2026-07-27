package com.leccionario.backend.inventory;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "purchase_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder extends BaseEntity {
    @Column(nullable = false, length = 30)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false)
    private LocalDate orderDate;

    private LocalDate expectedDate;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(length = 30)
    private String status = "PENDIENTE"; // PENDIENTE, APROBADA, RECIBIDA, CANCELADA

    @Column(length = 300)
    private String description;

    @Column(nullable = false)
    private Long institutionId;

    @Column(nullable = false)
    private Long requestedByUserId;
}
