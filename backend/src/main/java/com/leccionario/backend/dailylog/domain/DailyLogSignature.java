package com.leccionario.backend.dailylog.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "daily_log_signatures")
public class DailyLogSignature extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "daily_log_id", nullable = false)
    private DailyLog dailyLog;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "signer_user_id", nullable = false)
    private User signerUser;

    @Column(nullable = false, length = 40)
    private String signerRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DailyLogSignatureType signatureType;

    @Column(nullable = false)
    private LocalDateTime signedAt;

    @Column(length = 300)
    private String notes;
}
