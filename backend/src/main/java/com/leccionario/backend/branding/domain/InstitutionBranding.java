package com.leccionario.backend.branding.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.institution.domain.Institution;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "institution_branding")
public class InstitutionBranding extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false, unique = true)
    private Institution institution;

    @Column(nullable = false, length = 200)
    private String displayName;

    @Column(nullable = false, length = 80)
    private String loginBadgeText;

    @Column(nullable = false, length = 200)
    private String loginTitle;

    @Column(nullable = false, length = 400)
    private String loginSubtitle;

    @Column(nullable = false, length = 200)
    private String loginHelperText;

    @Column(nullable = false, length = 200)
    private String shellTitle;

    @Column(nullable = false, length = 300)
    private String shellSubtitle;

    @Column(nullable = false, length = 200)
    private String mobileTitle;

    @Column(nullable = false, length = 300)
    private String mobileSubtitle;

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 500)
    private String loginLogoUrl;

    @Column(nullable = false, length = 7)
    private String primaryColor;

    @Column(nullable = false, length = 7)
    private String secondaryColor;

    @Column(nullable = false, length = 7)
    private String accentColor;

    @Column(nullable = false, length = 7)
    private String backgroundColor;

    @Column(nullable = false, length = 7)
    private String surfaceColor;

    @Column(nullable = false, length = 7)
    private String textColor;

    @Column(nullable = false, length = 7)
    private String contrastTextColor;

    @Column(nullable = false, length = 7)
    private String mutedTextColor;

    @Column(nullable = false, length = 7)
    private String headingLargeColor;

    @Column(nullable = false, length = 7)
    private String headingMediumColor;

    @Column(nullable = false, length = 7)
    private String bodyTextColor;

    @Column(nullable = false, length = 7)
    private String buttonColor;

    @Column(nullable = false, length = 7)
    private String buttonTextColor;
}
