import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './staff-permissions.component.html',
  styleUrl: './staff-permissions.component.css',
    selector: 'app-staff-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class StaffPermissionsComponent implements OnInit {
  permissions: any[] = [];
  total = 0;
  pendingCount = 0;
  approved = 0;
  rejected = 0;
  showCreateModal = false;
  newPerm: any = { employeeId: null, permissionType: 'PERSONAL', startDate: '', endDate: '', reason: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/permissions/pending`).subscribe({
      next: r => {
        this.permissions = r;
        this.pendingCount = r.length;
      },
      error: () => {}
    });
  }

  approve(id: number) {
    this.http.post<any>(`${API_URL}/hr/permissions/${id}/approve`, {}).subscribe({ next: () => this.load() });
  }

  reject(id: number) {
    this.http.post<any>(`${API_URL}/hr/permissions/${id}/reject`, {}).subscribe({ next: () => this.load() });
  }

  create() {
    this.http.post<any>(`${API_URL}/hr/permissions`, this.newPerm).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
