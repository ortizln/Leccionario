import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  private auth = inject(AuthService);

  canExportReports = this.auth.hasPermission('REPORT_EXPORT');
  canViewAudit = this.auth.hasPermission('AUDIT_VIEW');
}
