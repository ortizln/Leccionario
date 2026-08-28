import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  canManageLessonPlans = this.auth.hasPermission('LESSONPLAN_MANAGE');
  canExportReports = this.auth.hasPermission('REPORT_EXPORT');
  canViewReports = this.auth.hasPermission('REPORT_VIEW');
  canViewUsers = this.auth.hasPermission('USER_VIEW');
  canViewAcademic = this.auth.hasPermission('ACADEMIC_VIEW');
  canViewLessonPlans = this.auth.hasPermission('LESSONPLAN_VIEW');
  canViewAudit = this.auth.hasPermission('AUDIT_VIEW');

  metrics$ = this.canViewReports
    ? this.http.get<{
        totalUsers: number;
        totalTeachers: number;
        totalStudents: number;
        totalLessonPlans: number;
        totalEvaluations: number;
      }>(`${API_URL}/reports/dashboard`).pipe(
        catchError(() => of({
          totalUsers: 0,
          totalTeachers: 0,
          totalStudents: 0,
          totalLessonPlans: 0,
          totalEvaluations: 0
        }))
      )
    : of(null);
}
