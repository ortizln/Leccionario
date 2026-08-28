import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './classrooms.component.html',
  styleUrl: './classrooms.component.css',
    selector: 'app-classrooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ClassroomsComponent implements OnInit {
  classrooms: any[] = [];
  stats: any = null;
  showForm = false;
  editId: number | null = null;
  formName = ''; formCode = ''; formType = 'AULA'; formCapacity = 40; formFloor = ''; formWing = '';
  formProjector = false; formComputers = false; formCompCount = 0; formInternet = false;
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); this.loadStats(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  load() { this.http.get<any[]>(`${API_URL}/institution/classrooms/institution/${this.instId}`).subscribe({ next: d => this.classrooms = d }); }
  loadStats() { this.http.get<any>(`${API_URL}/institution/classrooms/stats/${this.instId}`).subscribe({ next: d => this.stats = d }); }

  save() {
    const body: any = { institutionId: this.instId, name: this.formName, code: this.formCode, classroomType: this.formType,
      capacity: this.formCapacity, floor: this.formFloor, wing: this.formWing,
      hasProjector: this.formProjector, hasComputers: this.formComputers, computerCount: this.formCompCount, hasInternet: this.formInternet };
    const obs = this.editId ? this.http.put(`${API_URL}/institution/classrooms/${this.editId}`, body) : this.http.post(`${API_URL}/institution/classrooms`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.showForm = false; this.load(); this.loadStats(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(c: any) { this.editId = c.id; this.formName = c.name; this.formCode = c.code; this.formType = c.classroomType; this.formCapacity = c.capacity; this.formFloor = c.floor || ''; this.formWing = c.wing || ''; this.formProjector = c.hasProjector; this.formComputers = c.hasComputers; this.formCompCount = c.computerCount || 0; this.formInternet = c.hasInternet; this.showForm = true; }

  delete(id: number) { if (!confirm('Eliminar aula?')) return; this.http.delete(`${API_URL}/institution/classrooms/${id}`).subscribe({ next: () => { this.load(); this.loadStats(); this.showMsg('Eliminada'); }, error: () => this.showMsg('Error', true) }); }

  resetForm() { this.editId = null; this.formName = ''; this.formCode = ''; this.formType = 'AULA'; this.formCapacity = 40; this.formFloor = ''; this.formWing = ''; this.formProjector = false; this.formComputers = false; this.formCompCount = 0; this.formInternet = false; }

  typeLabel(t: string): string { const m: Record<string, string> = { AULA: 'Aula', LABORATORIO: 'Lab', TALLER: 'Taller', AUDITORIO: 'Auditorio', BIBLIOTECA: 'Biblioteca', CANCHA: 'Cancha', OTRO: 'Otro' }; return m[t] || t; }
}
