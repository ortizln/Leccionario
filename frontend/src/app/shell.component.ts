import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { BrandingService } from './core/branding.service';
import { WebSocketService } from './core/websocket.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html'
})
export class ShellComponent implements OnInit, OnDestroy {
  protected auth = inject(AuthService);
  protected brandingService = inject(BrandingService);
  private ws = inject(WebSocketService);
  private router = inject(Router);

  protected academicMenuOpen = false;
  sidebarCollapsed = false;

  constructor() {
    this.brandingService.syncAuthenticatedBranding();
    this.academicMenuOpen = this.router.url.startsWith('/app/academic/');
  }

  ngOnInit(): void {
    this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (this.sidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    }
    this.ws.connect(this.auth);
  }

  ngOnDestroy(): void {
    this.ws.disconnect();
  }

  protected toggleAcademicMenu(): void {
    this.academicMenuOpen = !this.academicMenuOpen;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', String(this.sidebarCollapsed));
    document.body.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
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
