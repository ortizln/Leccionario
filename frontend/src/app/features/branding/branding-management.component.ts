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
      (this.model[key] as string) = value;
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
    this.model.primaryColor = '#586B3B';
    this.model.secondaryColor = '#7A5C3E';
    this.model.accentColor = '#E9DFC9';
    this.model.backgroundColor = '#F2EFE7';
    this.model.surfaceColor = '#FBF8F1';
    this.model.textColor = '#2E261B';
    this.model.contrastTextColor = '#FFFFFF';
    this.model.mutedTextColor = '#8C7D6B';
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
