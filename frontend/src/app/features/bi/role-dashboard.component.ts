import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './role-dashboard.component.html',
  styleUrl: './role-dashboard.component.css',
    selector: 'app-role-dashboard',
  standalone: true,
  imports: [CommonModule],
})
export class RoleDashboardComponent implements OnInit {
  role = '';
  data: any = {};

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {
    this.role = this.auth.primaryRole() || 'RECTOR';
    this.load();
  }
  private get instId(): number { return this.auth.institutionId() || 1; }

  get roleLabel(): string {
    const labels: Record<string, string> = { ROLE_RECTOR: 'Rector', ROLE_INSPECTOR: 'Inspector', ROLE_COORDINADOR: 'Coordinador', ROLE_FINANCIERO: 'Financiero', ROLE_DOCENTE: 'Docente', ROLE_ADMINISTRADOR: 'Administrador' };
    return labels[this.role] || this.role;
  }

  get gradeEntries(): any[] {
    if (!this.data.gradeDistribution?.distribution) return [];
    return this.data.gradeDistribution.distribution.map((d: any) => ({
      label: d.grade || d.range || '-',
      count: d.count || 0,
      percent: this.data.gradeDistribution.total ? (d.count / this.data.gradeDistribution.total * 100) : 0
    }));
  }

  get totalCollected(): number {
    return (this.data.financialSummary || []).reduce((s: number, f: any) => s + (f.total_collected || 0), 0);
  }

  get totalPending(): number {
    return (this.data.financialSummary || []).reduce((s: number, f: any) => s + (f.total_pending || 0), 0);
  }

  load() {
    this.http.get<any>(`${API_URL}/bi/role-dashboard?institutionId=${this.instId}&role=${this.role}`).subscribe({
      next: r => this.data = r,
      error: () => {}
    });
  }
}
