import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BrandingService,
  BrandingSlide,
  InstitutionBranding,
  InstitutionBrandingPayload,
  PublicInstitutionOption
} from '../../core/branding.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-branding-management',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './branding-management.component.html',
  styleUrl: './branding-management.component.css'
})
export class BrandingManagementComponent {
  private brandingService = inject(BrandingService);
  private auth = inject(AuthService);

  institutions: PublicInstitutionOption[] = [];
  selectedInstitutionId: number | null = null;
  model = this.emptyModel();
  slides: BrandingSlide[] = [];
  message = '';
  messageType: 'success' | 'error' = 'success';

  readonly colorFields: Array<{ key: keyof InstitutionBrandingPayload; label: string }> = [
    { key: 'primaryColor', label: 'Primario' },
    { key: 'secondaryColor', label: 'Secundario' },
    { key: 'accentColor', label: 'Acento' },
    { key: 'backgroundColor', label: 'Fondo' },
    { key: 'surfaceColor', label: 'Superficie' },
    { key: 'textColor', label: 'Texto principal' },
    { key: 'contrastTextColor', label: 'Texto en contraste' },
    { key: 'mutedTextColor', label: 'Texto suave' }
  ];

  getColorValue(key: keyof InstitutionBrandingPayload): string {
    const value = this.model[key];
    return typeof value === 'string' ? value : '';
  }

  setColorValue(key: keyof InstitutionBrandingPayload, value: string): void {
    if (typeof this.model[key] === 'string') {
      this.model = {
        ...this.model,
        [key]: value
      };
      this.updateCSSVariables(this.model);
      this.applyButtonColors(this.model);
    }
  }

  constructor() {
    this.brandingService.loadPublicInstitutions().subscribe({
      next: (institutions) => {
        this.institutions = institutions;
        const preferred = this.auth.institutionId() ?? institutions[0]?.id ?? null;
        this.selectedInstitutionId = preferred;
        if (preferred) {
          this.loadInstitution(preferred);
        }
      },
      error: () => {
        this.messageType = 'error';
        this.message = 'No se pudo cargar el listado de instituciones.';
      }
    });
  }

  onInstitutionChange(): void {
    if (this.selectedInstitutionId) {
      this.loadInstitution(this.selectedInstitutionId);
    }
  }

  applyMilitaryPalette(): void {
    this.model = {
      ...this.model,
      primaryColor: '#586B3B',
      secondaryColor: '#7A5C3E',
      accentColor: '#E9DFC9',
      backgroundColor: '#F2EFE7',
      surfaceColor: '#FBF8F1',
      textColor: '#2E261B',
      contrastTextColor: '#FFFFFF',
      mutedTextColor: '#8C7D6B'
    };
    this.updateCSSVariables(this.model);
  }
  }

  applyOceanPalette(): void {
    this.model = {
      ...this.model,
      primaryColor: '#1B4965',
      secondaryColor: '#2A7E8E',
      accentColor: '#90E0EF',
      backgroundColor: '#E8F4F8',
      surfaceColor: '#F5F9FB',
      textColor: '#0F3460',
      contrastTextColor: '#FFFFFF',
      mutedTextColor: '#5C7A8F'
    };
    this.updateCSSVariables(this.model);
  }

  applySunsetPalette(): void {
    this.model = {
      ...this.model,
      primaryColor: '#D62828',
      secondaryColor: '#F77F00',
      accentColor: '#FCBF49',
      backgroundColor: '#FFF8F3',
      surfaceColor: '#FFFBF5',
      textColor: '#2C1810',
      contrastTextColor: '#FFFFFF',
      mutedTextColor: '#8B6F47'
    };
    this.updateCSSVariables(this.model);
  }

  applyForestPalette(): void {
    this.model = {
      ...this.model,
      primaryColor: '#2D6A4F',
      secondaryColor: '#40916C',
      accentColor: '#95D5B2',
      backgroundColor: '#E8F5E9',
      surfaceColor: '#F1F8F5',
      textColor: '#1B3A2C',
      contrastTextColor: '#FFFFFF',
      mutedTextColor: '#52796F'
    };
    this.updateCSSVariables(this.model);
  }

  applyMinimalPalette(): void {
    this.model = {
      ...this.model,
      primaryColor: '#333333',
      secondaryColor: '#666666',
      accentColor: '#E5E5E5',
      backgroundColor: '#F9F9F9',
      surfaceColor: '#FFFFFF',
      textColor: '#1C1C1C',
      contrastTextColor: '#FFFFFF',
      mutedTextColor: '#999999'
    };
    this.updateCSSVariables(this.model);
  }

  addSlide(): void {
    this.slides = [
      ...this.slides,
      {
        id: null,
        badge: 'Nuevo',
        title: 'Nueva leyenda institucional',
        description: 'Describe aqui el mensaje que quieres mostrar en el carrusel.',
        imageUrl: '',
        slideOrder: this.slides.length + 1,
        active: true
      }
    ];
  }

  removeSlide(index: number): void {
    this.slides = this.slides.filter((_, current) => current !== index)
      .map((slide, current) => ({ ...slide, slideOrder: current + 1 }));
  }

  uploadLogo(event: Event, key: 'logoUrl' | 'loginLogoUrl'): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.brandingService.uploadAsset(file).subscribe({
      next: (response) => {
        this.model[key] = response.url;
        this.messageType = 'success';
        this.message = 'Imagen cargada correctamente.';
      },
      error: (error) => {
        this.messageType = 'error';
        this.message = error?.error?.message ?? 'No se pudo subir la imagen.';
      }
    });
  }

  uploadSlideImage(event: Event, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.slides[index]) {
      return;
    }
    this.brandingService.uploadAsset(file).subscribe({
      next: (response) => {
        this.slides[index] = { ...this.slides[index], imageUrl: response.url };
        this.slides = [...this.slides];
        this.messageType = 'success';
        this.message = 'Imagen del carrusel cargada correctamente.';
      },
      error: (error) => {
        this.messageType = 'error';
        this.message = error?.error?.message ?? 'No se pudo subir la foto del carrusel.';
      }
    });
  }

  save(): void {
    if (!this.selectedInstitutionId) {
      this.messageType = 'error';
      this.message = 'Selecciona una institucion antes de guardar.';
      return;
    }

    const payload: InstitutionBrandingPayload = {
      ...this.model,
      slides: this.slides.map((slide, index) => ({
        ...slide,
        slideOrder: index + 1
      }))
    };

    this.brandingService.saveInstitutionBranding(this.selectedInstitutionId, payload).subscribe({
      next: (branding) => {
        this.applyBranding(branding);
        this.messageType = 'success';
        this.message = 'La apariencia institucional se guardo correctamente.';
      },
      error: (error) => {
        this.messageType = 'error';
        this.message = this.extractApiError(error);
      }
    });
  }

  private loadInstitution(institutionId: number): void {
    this.brandingService.loadInstitutionBranding(institutionId).subscribe({
      next: (branding) => {
        this.applyBranding(branding);
        this.message = '';
      },
      error: (error) => {
        this.messageType = 'error';
        this.message = this.extractApiError(error);
      }
    });
  }

  private applyBranding(branding: InstitutionBranding): void {
    this.model = {
      displayName: branding.displayName,
      loginBadgeText: branding.loginBadgeText,
      loginTitle: branding.loginTitle,
      loginSubtitle: branding.loginSubtitle,
      loginHelperText: branding.loginHelperText,
      shellTitle: branding.shellTitle,
      shellSubtitle: branding.shellSubtitle,
      mobileTitle: branding.mobileTitle,
      mobileSubtitle: branding.mobileSubtitle,
      logoUrl: branding.logoUrl ?? '',
      loginLogoUrl: branding.loginLogoUrl ?? '',
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      accentColor: branding.accentColor,
      backgroundColor: branding.backgroundColor,
      surfaceColor: branding.surfaceColor,
      textColor: branding.textColor || '#2E261B',
      contrastTextColor: branding.contrastTextColor || '#FFFFFF',
      mutedTextColor: branding.mutedTextColor || '#8C7D6B',
      slides: []
    };
    this.slides = branding.slides.map((slide) => ({ ...slide }));
    this.updateCSSVariables(this.model);
    this.applyButtonColors(this.model);
  }

  private updateCSSVariables(brandingConfig: InstitutionBrandingPayload): void {
    const root = document.documentElement;
    // Text color variables
    root.style.setProperty('--text-heading-large', brandingConfig.primaryColor);
    root.style.setProperty('--text-heading-medium', brandingConfig.textColor);
    root.style.setProperty('--text-heading-small', brandingConfig.secondaryColor);
    root.style.setProperty('--text-body', brandingConfig.textColor);
    root.style.setProperty('--text-muted', brandingConfig.mutedTextColor);
    root.style.setProperty('--text-contrast', brandingConfig.contrastTextColor);

    // Card background variables with transparency - create gradient from surfaceColor to backgroundColor
    const surfaceRgb = this.hexToRgb(brandingConfig.surfaceColor).join(', ');
    const bgRgb = this.hexToRgb(brandingConfig.backgroundColor).join(', ');
    const cardGradient = `linear-gradient(180deg, rgba(${surfaceRgb}, 0.95), rgba(${bgRgb}, 0.98))`;
    
    root.style.setProperty('--card-bg', `rgba(${surfaceRgb}, 0.92)`);
    root.style.setProperty('--card-bg-alt', `rgba(${bgRgb}, 0.96)`);
    root.style.setProperty('--card-text', brandingConfig.textColor);
    root.style.setProperty('--card-border', `rgba(${this.hexToRgb(brandingConfig.primaryColor).join(', ')}, 0.12)`);
    root.style.setProperty('--card-gradient', cardGradient);
  }

  private hexToRgb(hex: string): number[] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  }

  private applyButtonColors(brandingConfig: InstitutionBrandingPayload): void {
    const root = document.documentElement;
    const primaryRgb = this.hexToRgb(brandingConfig.primaryColor).join(', ');
    root.style.setProperty('--btn-primary-base', brandingConfig.primaryColor);
    root.style.setProperty('--btn-primary-hover', brandingConfig.secondaryColor);
    root.style.setProperty('--btn-outline-border', `rgba(${primaryRgb}, 0.48)`);
    root.style.setProperty('--btn-outline-text', brandingConfig.primaryColor);
    root.style.setProperty('--btn-outline-bg', `rgba(${primaryRgb}, 0.04)`);
  }

  private emptyModel(): InstitutionBrandingPayload {
    return {
      displayName: '',
      loginBadgeText: '',
      loginTitle: '',
      loginSubtitle: '',
      loginHelperText: '',
      shellTitle: '',
      shellSubtitle: '',
      mobileTitle: '',
      mobileSubtitle: '',
      logoUrl: '',
      loginLogoUrl: '',
      primaryColor: '#586B3B',
      secondaryColor: '#7A5C3E',
      accentColor: '#E9DFC9',
      backgroundColor: '#F2EFE7',
      surfaceColor: '#FBF8F1',
      textColor: '#2E261B',
      contrastTextColor: '#FFFFFF',
      mutedTextColor: '#8C7D6B',
      slides: []
    };
  }

  private extractApiError(error: unknown): string {
    const apiError = error as { error?: { message?: string; errors?: Record<string, string> } };
    if (apiError?.error?.message) {
      return apiError.error.message;
    }
    const fieldErrors = apiError?.error?.errors;
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      return Object.values(fieldErrors).join(' | ');
    }
    return 'No se pudo guardar la configuracion institucional.';
  }
}
