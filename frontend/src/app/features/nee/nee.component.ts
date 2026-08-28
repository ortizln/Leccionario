import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './nee.component.html',
  styleUrl: './nee.component.css',
    selector: 'app-nee',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class NeeComponent implements OnInit {
  tab = 'list';
  neeList: any[] = [];
  neeStats: any = null;
  adaptations: any[] = [];
  filterType = '';
  editNeeId: number | null = null;
  editAdaptId: number | null = null;

  neeFormStudentId: number | null = null;
  neeFormType = 'COGNITIVA';
  neeFormSeverity = 'MODERADA';
  neeFormDiagnosis = '';
  neeFormDiagnosisDate = '';
  neeFormProfessional = '';
  neeFormDescription = '';
  neeFormIepSummary = '';
  neeFormStatus = 'ACTIVA';

  adaptFormNeeId: number | null = null;
  adaptFormStudentId: number | null = null;
  adaptFormType = 'ACCOMMODATION';
  adaptFormArea = '';
  adaptFormDescription = '';
  adaptFormGoals = '';
  adaptFormStrategies = '';
  adaptFormEvalAdjust = '';

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.loadNEE();
    this.loadStats();
  }

  private showMsg(msg: string, err = false) { this.message = msg; this.messageIsError = err; setTimeout(() => this.message = '', 4000); }

  loadStats() {
    this.http.get<any>(`${API_URL}/nee/stats`).subscribe({ next: d => this.neeStats = d });
  }

  loadNEE() {
    if (this.filterType) {
      this.http.get<any[]>(`${API_URL}/nee/type/${this.filterType}`).subscribe({ next: d => this.neeList = d });
    } else {
      this.http.get<any[]>(`${API_URL}/nee/active`).subscribe({ next: d => this.neeList = d });
    }
  }

  loadAdaptations() {
    if (this.neeList.length > 0) {
      const id = this.neeList[0].id;
      this.http.get<any[]>(`${API_URL}/adaptations/nee/${id}`).subscribe({ next: d => this.adaptations = d });
    }
  }

  editNEE(n: any) {
    this.editNeeId = n.id;
    this.neeFormStudentId = n.studentId;
    this.neeFormType = n.needType;
    this.neeFormSeverity = n.severity;
    this.neeFormDiagnosis = n.diagnosis;
    this.neeFormDiagnosisDate = n.diagnosisDate || '';
    this.neeFormProfessional = n.professional || '';
    this.neeFormDescription = n.description || '';
    this.neeFormIepSummary = n.iepSummary || '';
    this.neeFormStatus = n.status;
    this.tab = 'edit';
  }

  saveNEE() {
    const body: any = {
      studentId: this.neeFormStudentId, needType: this.neeFormType, severity: this.neeFormSeverity,
      diagnosis: this.neeFormDiagnosis, diagnosisDate: this.neeFormDiagnosisDate || null,
      professional: this.neeFormProfessional, description: this.neeFormDescription,
      iepSummary: this.neeFormIepSummary, status: this.neeFormStatus
    };
    const obs = this.editNeeId
      ? this.http.put(`${API_URL}/nee/${this.editNeeId}`, body)
      : this.http.post(`${API_URL}/nee`, body);
    obs.subscribe({
      next: () => { this.showMsg(this.editNeeId ? 'Actualizado' : 'Creado'); this.tab = 'list'; this.loadNEE(); this.loadStats(); this.resetForm(); },
      error: () => this.showMsg('Error', true)
    });
  }

  editAdapt(a: any) {
    this.editAdaptId = a.id;
    this.adaptFormNeeId = a.specialNeedsId;
    this.adaptFormStudentId = a.studentId;
    this.adaptFormType = a.adaptationType;
    this.adaptFormArea = a.area || '';
    this.adaptFormDescription = a.description;
    this.adaptFormGoals = a.goals || '';
    this.adaptFormStrategies = a.strategies || '';
    this.adaptFormEvalAdjust = a.evaluationAdjustments || '';
    this.tab = 'edit-adapt';
  }

  saveAdaptation() {
    const body: any = {
      specialNeedsId: this.adaptFormNeeId, studentId: this.adaptFormStudentId,
      adaptationType: this.adaptFormType, area: this.adaptFormArea,
      description: this.adaptFormDescription, goals: this.adaptFormGoals,
      strategies: this.adaptFormStrategies, evaluationAdjustments: this.adaptFormEvalAdjust
    };
    const obs = this.editAdaptId
      ? this.http.put(`${API_URL}/adaptations/${this.editAdaptId}`, body)
      : this.http.post(`${API_URL}/adaptations`, body);
    obs.subscribe({
      next: () => { this.showMsg(this.editAdaptId ? 'Actualizada' : 'Creada'); this.tab = 'adapt'; this.loadAdaptations(); this.resetAdaptForm(); },
      error: () => this.showMsg('Error', true)
    });
  }

  resetForm() { this.neeFormStudentId = null; this.neeFormDiagnosis = ''; this.neeFormProfessional = ''; this.neeFormDescription = ''; this.neeFormIepSummary = ''; this.editNeeId = null; }
  resetAdaptForm() { this.adaptFormNeeId = null; this.adaptFormStudentId = null; this.adaptFormArea = ''; this.adaptFormDescription = ''; this.adaptFormGoals = ''; this.adaptFormStrategies = ''; this.adaptFormEvalAdjust = ''; this.editAdaptId = null; }

  typeLabel(t: string): string {
    const m: Record<string, string> = { COGNITIVA: 'Cognitiva', SENSORIAL: 'Sensorial', MOTRIZ: 'Motriz', COMUNICATIVA: 'Comunicativa', EMOCIONAL: 'Emocional', MULTIPLE: 'Multiple' };
    return m[t] || t;
  }

  adaptTypeLabel(t: string): string {
    const m: Record<string, string> = { ACCOMMODATION: 'Acomodo', MODIFICATION: 'Modificacion', AUXILIARY_SUPPORT: 'Apoyo', TOTAL: 'Total' };
    return m[t] || t;
  }
}
