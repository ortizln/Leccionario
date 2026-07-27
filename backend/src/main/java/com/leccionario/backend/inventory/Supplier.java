package com.leccionario.backend.inventory;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "suppliers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier extends BaseEntity {
    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 20)
    private String ruc;

    @Column(length = 100)
    private String contactName;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 200)
    private String address;

    @Column(length = 30)
    private String status = "ACTIVO"; // ACTIVO, INACTIVO

    @Column(nullable = false)
    private Long institutionId;
}
