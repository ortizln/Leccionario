import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './clubs.component.html',
  styleUrl: './clubs.component.css',
    selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ClubsComponent implements OnInit {
  tab = 'list';
  clubs: any[] = [];
  members: any[] = [];
  selectedClub: any = null;
  editId: number | null = null;
  f: any = { clubType: 'DEPORTIVO' };
  message = ''; isError = false;
  instId = 1;
  totalClubs = 0;
  activeClubs = 0;
  totalMembers = 0;
  uniqueStudents = 0;
  showAddMember = false;
  newMemberStudentId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  load() {
    this.http.get<any[]>(`${API_URL}/clubs/institution/${this.instId}/all`).subscribe({
      next: d => {
        this.clubs = d;
        this.totalClubs = d.length;
        this.activeClubs = d.filter(c => c.active).length;
      }
    });
    this.http.get<any>(`${API_URL}/clubs/institution/${this.instId}`).subscribe({
      next: (d: any[]) => {
        this.totalMembers = d.reduce((s: number, c: any) => s + (c.memberCount || 0), 0);
        this.uniqueStudents = d.length;
      },
      error: () => {}
    });
  }

  save() {
    const body = { ...this.f, institutionId: this.instId };
    const obs = this.editId ? this.http.put(`${API_URL}/clubs/${this.editId}`, body) : this.http.post(`${API_URL}/clubs`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.tab = 'list'; this.load(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(c: any) { this.editId = c.id; this.f = { ...c }; this.tab = 'new'; }
  deleteClub(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/clubs/${id}`).subscribe({ next: () => { this.load(); this.showMsg('Eliminado'); } }); }
  resetForm() { this.editId = null; this.f = { clubType: 'DEPORTIVO' }; }

  viewMembers(c: any) {
    this.selectedClub = c;
    this.tab = 'members';
    this.http.get<any[]>(`${API_URL}/clubs/${c.id}/members`).subscribe({ next: r => this.members = r, error: () => this.members = [] });
  }

  addMember() {
    if (!this.newMemberStudentId) { alert('Ingrese ID del estudiante'); return; }
    this.http.post(`${API_URL}/clubs/${this.selectedClub.id}/enroll`, { studentId: this.newMemberStudentId, status: 'ACTIVO' }).subscribe({
      next: () => { this.showAddMember = false; this.newMemberStudentId = null; this.viewMembers(this.selectedClub); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  removeMember(id: number) {
    if (!confirm('Remover miembro?')) return;
    this.http.delete(`${API_URL}/clubs/memberships/${id}`).subscribe({ next: () => this.viewMembers(this.selectedClub) });
  }
}
