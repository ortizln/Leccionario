import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
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
  headingLargeColor: string;
  headingMediumColor: string;
  bodyTextColor: string;
  buttonColor: string;
  buttonTextColor: string;
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
  private auth = inject(AuthService);
  private readonly storageKey = 'selected_institution_code';

  readonly branding = signal<InstitutionBranding | null>(null);
  readonly publicInstitutions = signal<PublicInstitutionOption[]>([]);
  readonly selectedInstitutionCode = signal<string>(this.readSelectedInstitutionCode());

  loadPublicInstitutions(): Observable<PublicInstitutionOption[]> {
    return this.http.get<PublicInstitutionOption[]>(`${API_URL}/public/institutions`).pipe(
      tap((institutions) => {
        this.publicInstitutions.set(institutions);
        if (!this.selectedInstitutionCode() && institutions.length > 0) {
          this.setSelectedInstitutionCode(institutions[0].code);
        }
      }),
      catchError(() => {
        this.publicInstitutions.set([]);
        return of([]);
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
      }),
      catchError(() => of(null as unknown as InstitutionBranding))
    );
  }

  loadInstitutionBranding(institutionId: number): Observable<InstitutionBranding> {
    return this.http.get<InstitutionBranding>(`${API_URL}/branding/${institutionId}`).pipe(
      tap((branding) => {
        this.branding.set(branding);
      }),
      catchError(() => of(null as unknown as InstitutionBranding))
    );
  }

  saveInstitutionBranding(institutionId: number, payload: InstitutionBrandingPayload): Observable<InstitutionBranding> {
    return this.http.put<InstitutionBranding>(`${API_URL}/branding/${institutionId}`, payload).pipe(
      tap((branding) => {
        this.branding.set(branding);
      }),
      catchError(() => of(null as unknown as InstitutionBranding))
    );
  }

  uploadAsset(file: File): Observable<{ fileName: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ fileName: string; url: string }>(`${API_URL}/branding/assets`, formData).pipe(
      catchError(() => of({ fileName: '', url: '' }))
    );
  }

  syncAuthenticatedBranding(): void {
    const institutionCode = this.auth.institutionCode() || this.selectedInstitutionCode();
    if (!institutionCode) {
      return;
    }
    this.loadPublicBranding(institutionCode).subscribe();
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

  private readSelectedInstitutionCode(): string {
    try {
      return window.localStorage.getItem(this.storageKey) ?? '';
    } catch {
      return '';
    }
  }
}
