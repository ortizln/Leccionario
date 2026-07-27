import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  canExportReports = this.auth.hasPermission('REPORT_EXPORT');
  canViewAudit = this.auth.hasPermission('AUDIT_VIEW');

  openLessonPlanReport() { this.router.navigate(['/app/lesson-plans']); }
  openCourseProgress() { this.router.navigate(['/app/bi']); }
  openAuditLog() { this.router.navigate(['/app/audit']); }
}
