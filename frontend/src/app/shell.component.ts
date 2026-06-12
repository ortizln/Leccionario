import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { BrandingService } from './core/branding.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  protected auth = inject(AuthService);
  protected brandingService = inject(BrandingService);
  private router = inject(Router);

  protected academicMenuOpen = false;

  constructor() {
    this.brandingService.syncAuthenticatedBranding();
    this.academicMenuOpen = this.router.url.startsWith('/app/academic/');
  }

  protected toggleAcademicMenu(): void {
    this.academicMenuOpen = !this.academicMenuOpen;
  }

  protected displayName(): string {
    const fullName = this.auth.fullName() || this.auth.username() || 'Sesion activa';
    return this.auth.primaryRole() === 'Docente' ? `Lic. ${fullName}` : fullName;
  }

  protected roleLine(): string {
    return this.auth.primaryRole() || 'Usuario del sistema';
  }

  protected subjectLine(): string {
    return this.auth.specialization()
      ? `Materia: ${this.auth.specialization()}`
      : this.auth.hasPermission('USER_MANAGE')
        ? 'Acceso: todos los modulos'
        : 'Materia: no asignada';
  }

  protected institutionTitle(): string {
    return this.brandingService.branding()?.displayName ?? this.auth.institutionName() ?? 'Unidad Educativa';
  }

  protected shellTitle(): string {
    return this.brandingService.branding()?.shellTitle ?? 'Leccionario Estudiantil Digital';
  }

  protected shellSubtitle(): string {
    return this.brandingService.branding()?.shellSubtitle ?? 'Control de leccionario, avance curricular y auditoria academica.';
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
