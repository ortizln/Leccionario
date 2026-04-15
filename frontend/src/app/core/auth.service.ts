import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiUrl = API_URL;

  login(payload: { username: string; password: string }) {
    return this.http.post<AuthSession>(`${this.apiUrl}/auth/login`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  token(): string | null {
    return this.session()?.token ?? null;
  }

  username(): string | null {
    return this.session()?.username ?? null;
  }

  fullName(): string | null {
    return this.session()?.fullName ?? null;
  }

  primaryRole(): string | null {
    return this.session()?.primaryRole ?? null;
  }

  specialization(): string | null {
    return this.session()?.specialization ?? null;
  }

  institutionId(): number | null {
    return this.session()?.institutionId ?? null;
  }

  institutionCode(): string | null {
    return this.session()?.institutionCode ?? null;
  }

  institutionName(): string | null {
    return this.session()?.institutionName ?? null;
  }

  roles(): string[] {
    return this.session()?.roles ?? [];
  }

  isAdmin(): boolean {
    return this.roles().includes('ROLE_ADMINISTRADOR');
  }

  permissions(): string[] {
    return this.session()?.permissions ?? [];
  }

  hasPermission(permission: string): boolean {
    return this.isAdmin() || this.permissions().includes(permission);
  }

  defaultRoute(): string {
    if (this.hasPermission('USER_VIEW')) {
      return '/app/users';
    }
    if (this.hasPermission('ACADEMIC_VIEW')) {
      return '/app/academic';
    }
    if (this.hasPermission('LESSONPLAN_VIEW')) {
      return '/app/lesson-plans';
    }
    if (this.hasPermission('REPORT_VIEW')) {
      return '/app/reports';
    }
    if (this.hasPermission('AUDIT_VIEW')) {
      return '/app/audit';
    }
    return '/app';
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  logout(): void {
    try {
      window.localStorage.removeItem('auth_session');
    } catch {
      // Evita romper si el navegador bloquea storage.
    }
  }

  private session(): AuthSession | null {
    try {
      const raw = window.localStorage.getItem('auth_session');
      return raw ? JSON.parse(raw) as AuthSession : null;
    } catch {
      return null;
    }
  }

  private setSession(session: AuthSession): void {
    try {
      window.localStorage.setItem('auth_session', JSON.stringify(session));
    } catch {
      // Evita romper el arranque si el navegador bloquea storage.
    }
  }
}

type AuthSession = {
  token: string;
  username: string;
  fullName: string;
  primaryRole: string;
  specialization: string | null;
  institutionId: number;
  institutionCode: string;
  institutionName: string;
  roles: string[];
  permissions: string[];
};
