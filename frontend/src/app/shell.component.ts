import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { BrandingService } from './core/branding.service';
import { WebSocketService } from './core/websocket.service';
import { GlobalSearchComponent } from './features/search/global-search.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, GlobalSearchComponent, CommonModule],
  templateUrl: './shell.component.html'
})
export class ShellComponent implements OnInit, OnDestroy {
  protected auth = inject(AuthService);
  protected brandingService = inject(BrandingService);
  private ws = inject(WebSocketService);
  private router = inject(Router);

  protected academicMenuOpen = false;
  protected rrhhMenuOpen = false;
  protected welfareMenuOpen = false;
  protected financeMenuOpen = false;
  protected inventoryMenuOpen = false;
  protected biMenuOpen = false;
  protected commMenuOpen = false;
  protected aiMenuOpen = false;
  protected gradingMenuOpen = false;
  protected institutionalMenuOpen = false;
  protected systemMenuOpen = false;
  sidebarCollapsed = false;
  showSearch = false;
  showNotifications = false;
  unreadCount = 0;

  constructor() {
    this.brandingService.syncAuthenticatedBranding();
    const url = this.router.url;
    this.academicMenuOpen = url.startsWith('/app/academic/');
    this.rrhhMenuOpen = url.startsWith('/app/employees') || url.startsWith('/app/contracts') || url.startsWith('/app/payroll');
    this.welfareMenuOpen = url.startsWith('/app/student-') || url.startsWith('/app/scholarships') || url.startsWith('/app/clubs') || url.startsWith('/app/transport');
    this.financeMenuOpen = url.startsWith('/app/cashier') || url.startsWith('/app/invoices') || url.startsWith('/app/tuition');
    this.inventoryMenuOpen = url.startsWith('/app/assets') || url.startsWith('/app/library') || url.startsWith('/app/book-');
    this.biMenuOpen = url.startsWith('/app/bi-') || url.startsWith('/app/role-dashboard');
    this.commMenuOpen = url.startsWith('/app/notifications') || url.startsWith('/app/messages') || url.startsWith('/app/communication') || url.startsWith('/app/circulars') || url.startsWith('/app/school-events');
    this.aiMenuOpen = url.startsWith('/app/ai-') || url.startsWith('/app/batch-');
    this.gradingMenuOpen = url.startsWith('/app/grading') || url.startsWith('/app/rubrics') || url.startsWith('/app/competencies') || url.startsWith('/app/recovery');
    this.institutionalMenuOpen = url.startsWith('/app/campus') || url.startsWith('/app/shifts') || url.startsWith('/app/classrooms') || url.startsWith('/app/calendar') || url.startsWith('/app/academic-periods') || url.startsWith('/app/institution-settings') || url.startsWith('/app/branding');
    this.systemMenuOpen = url.startsWith('/app/users') || url.startsWith('/app/audit') || url.startsWith('/app/data-export');
  }

  ngOnInit(): void {
    this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (this.sidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    }
    this.ws.connect(this.auth);
    this.ws.unreadCount$.subscribe(count => this.unreadCount = count);
  }

  ngOnDestroy(): void {
    this.ws.disconnect();
  }

  protected toggleAcademicMenu(): void {
    this.academicMenuOpen = !this.academicMenuOpen;
  }
  protected toggleRrhhMenu(): void { this.rrhhMenuOpen = !this.rrhhMenuOpen; }
  protected toggleWelfareMenu(): void { this.welfareMenuOpen = !this.welfareMenuOpen; }
  protected toggleFinanceMenu(): void { this.financeMenuOpen = !this.financeMenuOpen; }
  protected toggleInventoryMenu(): void { this.inventoryMenuOpen = !this.inventoryMenuOpen; }
  protected toggleBiMenu(): void { this.biMenuOpen = !this.biMenuOpen; }
  protected toggleCommMenu(): void { this.commMenuOpen = !this.commMenuOpen; }
  protected toggleAiMenu(): void { this.aiMenuOpen = !this.aiMenuOpen; }
  protected toggleGradingMenu(): void { this.gradingMenuOpen = !this.gradingMenuOpen; }
  protected toggleSystemMenu(): void { this.systemMenuOpen = !this.systemMenuOpen; }
  protected toggleInstitutionalMenu(): void { this.institutionalMenuOpen = !this.institutionalMenuOpen; }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.ws.markAllRead();
    }
  }

  getNotifications() {
    return this.ws.getNotifications();
  }

  markRead(id: string): void {
    this.ws.markRead(id);
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
