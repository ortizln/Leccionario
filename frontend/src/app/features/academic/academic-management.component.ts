import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';
import { AcademicOverview } from './academic.models';

@Component({
  selector: 'app-academic-management',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './academic-management.component.html',
  styleUrl: './academic-management.component.css'
})
export class AcademicManagementComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  canManageAcademic = this.auth.hasPermission('ACADEMIC_MANAGE');
  errorMessage = '';
  overview: AcademicOverview = { courses: [], subjects: [], periods: [], students: [], teachers: [] };

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.http.get<AcademicOverview>(`${API_URL}/academic/overview`).pipe(
      catchError(() => {
        this.errorMessage = 'No se pudo cargar la estructura academica.';
        return of({ courses: [], subjects: [], periods: [], students: [], teachers: [] });
      })
    ).subscribe(data => {
      this.errorMessage = '';
      this.overview = data;
    });
  }
}
