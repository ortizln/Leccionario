import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { BrandingService } from '../../core/branding.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private brandingService = inject(BrandingService);
  private router = inject(Router);
  private slideTimer: ReturnType<typeof setInterval> | null = null;
  institutions = this.brandingService.publicInstitutions();
  selectedInstitutionCode = this.brandingService.selectedInstitutionCode();
  currentSlideIndex = 0;
  loginError = '';
  isLoading = false;

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor() {
    this.brandingService.loadPublicInstitutions().subscribe({
      next: (institutions) => {
        this.institutions = institutions;
        this.selectedInstitutionCode = this.brandingService.selectedInstitutionCode() || institutions[0]?.code || '';
        void this.loadBranding(this.selectedInstitutionCode);
      },
      error: () => {
        this.institutions = [];
        this.selectedInstitutionCode = '';
      }
    });
    this.startCarousel();
  }

  branding() {
    return this.brandingService.branding() ?? this.brandingService.defaultBranding();
  }

  activeSlides() {
    const slides = this.branding().slides.filter((slide) => slide.active);
    return slides;
  }

  currentSlide() {
    const slides = this.activeSlides();
    if (slides.length === 0) {
      return {
        id: null,
        badge: this.branding().loginBadgeText,
        title: this.branding().loginTitle,
        description: this.branding().loginSubtitle,
        imageUrl: this.branding().loginLogoUrl || this.branding().logoUrl || '',
        slideOrder: 1,
        active: true
      };
    }
    return slides[this.currentSlideIndex % slides.length];
  }

  changeInstitution(code: string): void {
    this.selectedInstitutionCode = code;
    void this.loadBranding(code);
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.loginError = '';
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isLoading = false;
        this.brandingService.syncAuthenticatedBranding();
        void this.router.navigateByUrl(this.authService.defaultRoute());
      },
      error: () => {
        this.isLoading = false;
        this.loginError = 'Usuario o contraseña incorrectos';
      }
    });
  }

  private async loadBranding(code: string): Promise<void> {
    this.brandingService.setSelectedInstitutionCode(code);
    await new Promise<void>((resolve) => {
      this.brandingService.loadPublicBranding(code).subscribe({
        next: () => {
          this.currentSlideIndex = 0;
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  private startCarousel(): void {
    this.slideTimer = setInterval(() => {
      const slides = this.activeSlides();
      if (slides.length > 1) {
        this.currentSlideIndex = (this.currentSlideIndex + 1) % slides.length;
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
  }
}
