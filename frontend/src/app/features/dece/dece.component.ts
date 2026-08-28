import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './dece.component.html',
  styleUrl: './dece.component.css',
    selector: 'app-dece',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DeceComponent implements OnInit {
  tab = 'list';
  cases: any[] = [];
  stats: any = null;
  followUps: any[] = [];
  filterType = '';
  filterStatus = '';
  editId: number | null = null;

  formStudentId: number | null = null;
  formCaseType = 'ACADEMICA';
  formPriority = 'NORMAL';
  formDescription = '';
  formCounselor = '';
  formInterventions = '';
  formResult = '';
  formStatus = 'ABIERTO';

  fuNotes = '';
  fuActions = '';
  fuNextSteps = '';

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.loadCases();
    this.loadStats();
  }

  private showMsg(msg: string, err = false) { this.message = msg; this.messageIsError = err; setTimeout(() => this.message = '', 4000); }

  loadStats() {
    this.http.get<any>(`${API_URL}/dece/stats`).subscribe({ next: d => this.stats = d });
  }

  loadCases() {
    if (this.filterType) {
      this.http.get<any[]>(`${API_URL}/dece/cases/type/${this.filterType}`).subscribe({ next: d => this.cases = d });
    } else if (this.filterStatus) {
      this.http.get<any[]>(`${API_URL}/dece/cases/open`).subscribe({ next: d => this.cases = d });
    } else {
      this.http.get<any[]>(`${API_URL}/dece/cases/open`).subscribe({ next: d => this.cases = d });
    }
  }

  viewCase(c: any) {
    this.editId = c.id;
    this.formStudentId = c.studentId;
    this.formCaseType = c.caseType;
    this.formPriority = c.priority;
    this.formDescription = c.description;
    this.formCounselor = c.counselorName || '';
    this.formInterventions = c.interventions || '';
    this.formResult = c.result || '';
    this.formStatus = c.status;
    this.loadFollowUps();
    this.tab = 'edit';
  }

  editCase(c: any) { this.viewCase(c); }

  loadFollowUps() {
    if (this.editId) {
      this.http.get<any[]>(`${API_URL}/dece/cases/${this.editId}/follow-ups`)
        .subscribe({ next: d => this.followUps = d });
    }
  }

  saveCase() {
    const body: any = {
      studentId: this.formStudentId, caseType: this.formCaseType, priority: this.formPriority,
      description: this.formDescription, counselorName: this.formCounselor,
      interventions: this.formInterventions, result: this.formResult, status: this.formStatus,
      closeDate: this.formStatus === 'CERRADO' ? new Date().toISOString().split('T')[0] : null
    };
    const obs = this.editId
      ? this.http.put(`${API_URL}/dece/cases/${this.editId}`, body)
      : this.http.post(`${API_URL}/dece/cases`, body);
    obs.subscribe({
      next: () => { this.showMsg(this.editId ? 'Actualizado' : 'Creado'); this.tab = 'list'; this.loadCases(); this.loadStats(); this.resetForm(); },
      error: () => this.showMsg('Error', true)
    });
  }

  addFollowUp() {
    if (!this.editId || !this.fuNotes) return;
    this.http.post(`${API_URL}/dece/cases/${this.editId}/follow-ups`, {
      notes: this.fuNotes, actionsTaken: this.fuActions, nextSteps: this.fuNextSteps
    }).subscribe({
      next: () => { this.fuNotes = ''; this.fuActions = ''; this.fuNextSteps = ''; this.loadFollowUps(); this.showMsg('Seguimiento agregado'); },
      error: () => this.showMsg('Error', true)
    });
  }

  resetForm() {
    this.editId = null; this.formStudentId = null; this.formDescription = '';
    this.formCounselor = ''; this.formInterventions = ''; this.formResult = ''; this.followUps = [];
  }

  caseTypeLabel(t: string): string {
    const m: Record<string, string> = { ACADEMICA: 'Academica', EMOCIONAL: 'Emocional', COMPORTAMIENTO: 'Comportamiento', FAMILIAR: 'Familiar', VIOLENCIA: 'Violencia', BULLYING: 'Bullying', OTRA: 'Otra' };
    return m[t] || t;
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { ABIERTO: 'Abierto', EN_PROCESO: 'En Proceso', CERRADO: 'Cerrado', REFERIDO: 'Referido' };
    return m[s] || s;
  }
}
