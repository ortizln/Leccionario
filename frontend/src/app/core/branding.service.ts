import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from './api.config';
import { AuthService } from './auth.service';

export type BrandingSlide = {
  id: number | null;
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  slideOrder: number;
  active: boolean;
};

export type InstitutionBranding = {
  institutionId: number;
  institutionCode: string;
  institutionName: string;
  displayName: string;
  loginBadgeText: string;
  loginTitle: string;
  loginSubtitle: string;
  loginHelperText: string;
  shellTitle: string;
  shellSubtitle: string;
  mobileTitle: string;
  mobileSubtitle: string;
  logoUrl: string | null;
  loginLogoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  contrastTextColor: string;
  mutedTextColor: string;
  slides: BrandingSlide[];
};

export type PublicInstitutionOption = {
  id: number;
  code: string;
  name: string;
};

export type InstitutionBrandingPayload = Omit<InstitutionBranding, 'institutionId' | 'institutionCode' | 'institutionName'>;

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private http = inject(HttpClient);
  private document = inject(DOCUMENT);
  private auth = inject(AuthService);
  private readonly storageKey = 'selected_institution_code';

  readonly branding = signal<InstitutionBranding | null>(null);
  readonly publicInstitutions = signal<PublicInstitutionOption[]>([]);
  readonly selectedInstitutionCode = signal<string>(this.readSelectedInstitutionCode());

  constructor() {
    this.applyTheme(this.defaultBranding());
  }

  loadPublicInstitutions(): Observable<PublicInstitutionOption[]> {
    return this.http.get<PublicInstitutionOption[]>(`${API_URL}/public/institutions`).pipe(
      tap((institutions) => {
        this.publicInstitutions.set(institutions);
        if (!this.selectedInstitutionCode() && institutions.length > 0) {
          this.setSelectedInstitutionCode(institutions[0].code);
        }
      })
    );
  }

  loadPublicBranding(institutionCode?: string | null): Observable<InstitutionBranding> {
    const selectedCode = institutionCode?.trim() || this.selectedInstitutionCode() || '';
    const query = selectedCode ? `?institutionCode=${encodeURIComponent(selectedCode)}` : '';
    return this.http.get<InstitutionBranding>(`${API_URL}/public/branding${query}`).pipe(
      tap((branding) => {
        this.branding.set(branding);
        this.setSelectedInstitutionCode(branding.institutionCode);
        this.applyTheme(branding);
      })
    );
  }

  loadInstitutionBranding(institutionId: number): Observable<InstitutionBranding> {
    return this.http.get<InstitutionBranding>(`${API_URL}/branding/${institutionId}`).pipe(
      tap((branding) => {
        this.branding.set(branding);
        this.applyTheme(branding);
      })
    );
  }

  saveInstitutionBranding(institutionId: number, payload: InstitutionBrandingPayload): Observable<InstitutionBranding> {
    return this.http.put<InstitutionBranding>(`${API_URL}/branding/${institutionId}`, payload).pipe(
      tap((branding) => {
        this.branding.set(branding);
        this.applyTheme(branding);
      })
    );
  }

  uploadAsset(file: File): Observable<{ fileName: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ fileName: string; url: string }>(`${API_URL}/branding/assets`, formData);
  }

  syncAuthenticatedBranding(): void {
    const institutionCode = this.auth.institutionCode() || this.selectedInstitutionCode();
    if (!institutionCode) {
      return;
    }
    this.loadPublicBranding(institutionCode).subscribe({
      error: () => {
        this.applyTheme(this.defaultBranding());
      }
    });
  }

  setSelectedInstitutionCode(code: string | null): void {
    const normalized = code?.trim() ?? '';
    this.selectedInstitutionCode.set(normalized);
    try {
      if (normalized) {
        window.localStorage.setItem(this.storageKey, normalized);
      } else {
        window.localStorage.removeItem(this.storageKey);
      }
    } catch {
      // Mantiene operativa la seleccion si el navegador bloquea storage.
    }
  }

  defaultBranding(): InstitutionBranding {
    return {
      institutionId: 0,
      institutionCode: '',
      institutionName: 'Unidad Educativa',
      displayName: 'Unidad Educativa',
      loginBadgeText: 'Acceso institucional',
      loginTitle: 'Bienvenido al Leccionario Digital',
      loginSubtitle: 'Ingresa con tus credenciales para continuar con el registro y control academico.',
      loginHelperText: 'Usa tu cuenta institucional.',
      shellTitle: 'Leccionario Estudiantil Digital',
      shellSubtitle: 'Control de leccionario, avance curricular y auditoria academica.',
      mobileTitle: 'Leccionario Mobile',
      mobileSubtitle: 'Consulta tu horario, registra novedades y cierra cada bloque desde una sola vista.',
      logoUrl: null,
      loginLogoUrl: null,
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

  private applyTheme(branding: InstitutionBranding): void {
    const root = this.document.documentElement;
    const primary = branding.primaryColor;
    const secondary = branding.secondaryColor;
    const accent = branding.accentColor;
    const background = branding.backgroundColor;
    const surface = branding.surfaceColor;
    const text = branding.textColor;
    const contrastText = branding.contrastTextColor;
    const mutedText = branding.mutedTextColor;

    root.style.setProperty('--app-primary', primary);
    root.style.setProperty('--app-secondary', secondary);
    root.style.setProperty('--app-accent', accent);
    root.style.setProperty('--app-bg', background);
    root.style.setProperty('--app-surface', this.hexToRgba(surface, 0.92));
    root.style.setProperty('--app-surface-strong', this.hexToRgba(surface, 0.98));
    root.style.setProperty('--app-line', this.hexToRgba(primary, 0.26));
    root.style.setProperty('--app-text', text);
    root.style.setProperty('--app-text-soft', mutedText);
    root.style.setProperty('--app-contrast-text', contrastText);
    root.style.setProperty('--app-contrast-text-rgb', this.hexToRgb(contrastText));
    root.style.setProperty('--app-muted-text-rgb', this.hexToRgb(mutedText));
    root.style.setProperty('--app-black', this.mixColors(background, '#000000', 0.2));
    root.style.setProperty('--app-black-soft', this.mixColors(background, '#000000', 0.1));
    root.style.setProperty('--app-primary-rgb', this.hexToRgb(primary));
    root.style.setProperty('--app-secondary-rgb', this.hexToRgb(secondary));
    root.style.setProperty('--app-accent-rgb', this.hexToRgb(accent));
    root.style.setProperty('--app-bg-rgb', this.hexToRgb(background));
    root.style.setProperty('--app-text-rgb', this.hexToRgb(text));
    root.style.setProperty('--app-muted-text', mutedText);
  }

  private readSelectedInstitutionCode(): string {
    try {
      return window.localStorage.getItem(this.storageKey) ?? '';
    } catch {
      return '';
    }
  }

  private hexToRgb(value: string): string {
    const normalized = value.replace('#', '');
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);
    return `${red}, ${green}, ${blue}`;
  }

  private hexToRgba(value: string, alpha: number): string {
    return `rgba(${this.hexToRgb(value)}, ${alpha})`;
  }

  private mixColors(first: string, second: string, weight: number): string {
    const a = first.replace('#', '');
    const b = second.replace('#', '');
    const mix = (start: string, end: string) =>
      Math.round(parseInt(start, 16) * (1 - weight) + parseInt(end, 16) * weight)
        .toString(16)
        .padStart(2, '0');
    return `#${mix(a.slice(0, 2), b.slice(0, 2))}${mix(a.slice(2, 4), b.slice(2, 4))}${mix(a.slice(4, 6), b.slice(4, 6))}`;
  }
}
