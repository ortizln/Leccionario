import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import QRCode from 'qrcode';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-lesson-plan',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './lesson-plan.component.html',
  styleUrl: './lesson-plan.component.css'
})
export class LessonPlanComponent {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  canManageLessonPlans = this.auth.hasPermission('LESSONPLAN_MANAGE');
  errorMessage = '';
  dailyLog: DailyLogItem | null = null;
  absenceDialogEntry: DailyLogEntryItem | null = null;
  absenceDrafts: DailyLogAbsenceDraft[] = [];
  incidentDialogEntry: DailyLogEntryItem | null = null;
  incidentDrafts: DailyLogIncidentDraft[] = [];
  qrDialogOpen = false;
  qrDialogTitle = '';
  qrDialogSubtitle = '';
  qrTargetUrl = '';
  qrDataUrl = '';

  overview: ScheduleOverview = {
    blocks: [],
    schedules: [],
    courses: [],
    periods: [],
    subjects: [],
    teachers: []
  };

  controlForm = this.fb.nonNullable.group({
    courseId: [0, Validators.required],
    periodId: [0, Validators.required],
    logDate: [this.today(), Validators.required],
    workDayNumber: [1],
    city: ['Tulcan'],
    generalNotes: ['']
  });

  constructor() {
    this.loadOverview();
  }

  selectedCourseLabel(): string {
    const course = this.overview.courses.find(item => item.id === this.controlForm.controls.courseId.value);
    return course ? `${course.name} ${course.parallel}` : 'Selecciona un curso';
  }

  canEditEntry(entry: DailyLogEntryItem): boolean {
    return this.canManageLessonPlans
      && !!this.dailyLog
      && this.dailyLog.status === 'DRAFT'
      && entry.blockType === 'CLASS'
      && entry.teacherSignatureStatus !== 'SIGNED';
  }

  generateDailyLog(): void {
    this.errorMessage = '';
    if (this.controlForm.invalid) {
      this.errorMessage = 'Completa curso, periodo y fecha para generar la jornada.';
      return;
    }

    this.http.post<DailyLogItem>(`${API_URL}/daily-logs/generate`, this.controlForm.getRawValue()).subscribe({
      next: (response) => this.dailyLog = this.mapDailyLog(response),
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo generar la jornada del leccionario.';
      }
    });
  }

  loadDailyLog(): void {
    this.errorMessage = '';
    const { courseId, logDate } = this.controlForm.getRawValue();
    if (!courseId || !logDate) {
      this.errorMessage = 'Selecciona curso y fecha para consultar.';
      return;
    }

    this.http.get<DailyLogItem>(`${API_URL}/daily-logs?courseId=${courseId}&logDate=${logDate}`).pipe(
      catchError((error) => {
        this.dailyLog = null;
        this.errorMessage = error?.error?.message ?? 'No se pudo consultar la jornada del leccionario.';
        return of(null);
      })
    ).subscribe((response) => {
      if (response) {
        this.dailyLog = this.mapDailyLog(response);
      }
    });
  }

  saveEntry(entry: DailyLogEntryItem): void {
    if (!this.dailyLog) {
      return;
    }

    this.http.put<DailyLogEntryItem>(`${API_URL}/daily-logs/${this.dailyLog.id}/entries/${entry.id}`, {
      didacticUnit: entry.didacticUnit,
      curricularSkill: entry.curricularSkill,
      topic: entry.topic,
      specificNotes: entry.specificNotes,
      generalNotes: entry.generalNotes,
      signed: entry.signed
    }).subscribe({
      next: (saved) => {
        const index = this.dailyLog?.entries.findIndex(item => item.id === entry.id) ?? -1;
        if (index >= 0 && this.dailyLog) {
          this.dailyLog.entries[index] = this.mapEntry(saved);
        }
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo guardar la fila del leccionario.';
      }
    });
  }

  openAbsenceDialog(entry: DailyLogEntryItem): void {
    this.absenceDialogEntry = entry;
    this.absenceDrafts = (this.dailyLog?.students ?? []).map((student) => {
      const existing = entry.absences.find(absence => absence.studentId === student.id);
      return {
        studentId: student.id,
        studentName: student.fullName,
        enrollmentNumber: student.enrollmentNumber,
        selected: !!existing,
        absenceType: (existing?.absenceType as 'ABSENT' | 'LATE' | 'JUSTIFIED' | undefined) ?? 'ABSENT',
        notes: existing?.notes ?? ''
      };
    });
  }

  closeAbsenceDialog(): void {
    this.absenceDialogEntry = null;
    this.absenceDrafts = [];
  }

  toggleAbsenceStudent(studentId: number, checked: boolean): void {
    const draft = this.absenceDrafts.find(item => item.studentId === studentId);
    if (draft) {
      draft.selected = checked;
    }
  }

  saveAbsences(): void {
    if (!this.dailyLog || !this.absenceDialogEntry) {
      return;
    }

    this.http.put<DailyLogEntryItem>(
      `${API_URL}/daily-logs/${this.dailyLog.id}/entries/${this.absenceDialogEntry.id}/absences`,
      {
        absences: this.absenceDrafts
          .filter(item => item.selected)
          .map(item => ({
            studentId: item.studentId,
            absenceType: item.absenceType,
            notes: item.notes || null
          }))
      }
    ).subscribe({
      next: (saved) => {
        const index = this.dailyLog?.entries.findIndex(item => item.id === saved.id) ?? -1;
        if (index >= 0 && this.dailyLog) {
          this.dailyLog.entries[index] = this.mapEntry(saved);
        }
        this.closeAbsenceDialog();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo guardar la lista de inasistencias.';
      }
    });
  }

  openIncidentDialog(entry: DailyLogEntryItem): void {
    this.incidentDialogEntry = entry;
    this.incidentDrafts = (this.dailyLog?.students ?? []).map((student) => {
      const existing = entry.incidents.find(incident => incident.studentId === student.id);
      return {
        studentId: student.id,
        studentName: student.fullName,
        enrollmentNumber: student.enrollmentNumber,
        selected: !!existing,
        category: existing?.category ?? 'DISCIPLINA',
        notes: existing?.notes ?? ''
      };
    });
  }

  closeIncidentDialog(): void {
    this.incidentDialogEntry = null;
    this.incidentDrafts = [];
  }

  toggleIncidentStudent(studentId: number, checked: boolean): void {
    const draft = this.incidentDrafts.find(item => item.studentId === studentId);
    if (draft) {
      draft.selected = checked;
    }
  }

  saveIncidents(): void {
    if (!this.dailyLog || !this.incidentDialogEntry) {
      return;
    }

    this.http.put<DailyLogEntryItem>(
      `${API_URL}/daily-logs/${this.dailyLog.id}/entries/${this.incidentDialogEntry.id}/incidents`,
      {
        incidents: this.incidentDrafts
          .filter(item => item.selected)
          .map(item => ({
            studentId: item.studentId,
            category: item.category,
            notes: item.notes
          }))
      }
    ).subscribe({
      next: (saved) => {
        const index = this.dailyLog?.entries.findIndex(item => item.id === saved.id) ?? -1;
        if (index >= 0 && this.dailyLog) {
          this.dailyLog.entries[index] = this.mapEntry(saved);
        }
        this.closeIncidentDialog();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudieron guardar las novedades especificas.';
      }
    });
  }

  async openEntryQr(entry: DailyLogEntryItem): Promise<void> {
    this.qrDialogTitle = `Cierre docente · ${entry.scheduleLabel}`;
    this.qrDialogSubtitle = `${entry.subjectName || 'Sin asignatura'} · ${entry.teacherName || 'Sin docente'}`;
    await this.openQrDialog(`/mobile/entry-close/${entry.closeToken}`);
  }

  async openLogQr(): Promise<void> {
    if (!this.dailyLog) {
      return;
    }
    this.qrDialogTitle = `Cierre final · ${this.dailyLog.courseName}`;
    this.qrDialogSubtitle = `Inspector general / responsable del curso`;
    await this.openQrDialog(`/mobile/log-close/${this.dailyLog.closeToken}`);
  }

  async openSignatureQr(signatureType: 'TEACHER_TUTOR' | 'WEEK_STUDENT'): Promise<void> {
    if (!this.dailyLog) {
      return;
    }
    this.qrDialogTitle = signatureType === 'TEACHER_TUTOR' ? 'Firma docente tutor' : 'Firma semanero';
    this.qrDialogSubtitle = `Jornada ${this.dailyLog.courseName}`;
    await this.openQrDialog(`/mobile/log-signature/${this.dailyLog.closeToken}/${signatureType}`);
  }

  closeQrDialog(): void {
    this.qrDialogOpen = false;
    this.qrDialogTitle = '';
    this.qrDialogSubtitle = '';
    this.qrTargetUrl = '';
    this.qrDataUrl = '';
  }

  private loadOverview(): void {
    this.http.get<ScheduleOverview>(`${API_URL}/schedules/overview`).pipe(
      catchError(() => {
        this.errorMessage = 'No se pudo cargar cursos y periodos para el leccionario diario.';
        return of({
          blocks: [],
          schedules: [],
          courses: [],
          periods: [],
          subjects: [],
          teachers: []
        });
      })
    ).subscribe((overview) => {
      this.overview = overview;
      this.controlForm.patchValue({
        courseId: overview.courses[0]?.id ?? 0,
        periodId: overview.periods[0]?.id ?? 0
      });
    });
  }

  private mapDailyLog(log: DailyLogItem): DailyLogItem {
    return {
      ...log,
      entries: log.entries.map(entry => this.mapEntry(entry))
    };
  }

  private mapEntry(entry: DailyLogEntryItem): DailyLogEntryItem {
    return {
      ...entry,
      signed: entry.teacherSignatureStatus === 'SIGNED'
    };
  }

  absenceLabel(absenceType: string): string {
    switch (absenceType) {
      case 'LATE':
        return 'Atraso';
      case 'JUSTIFIED':
        return 'Justificada';
      default:
        return 'Inasistencia';
    }
  }

  signatureLabel(signatureType: string): string {
    switch (signatureType) {
      case 'GENERAL_INSPECTOR':
        return 'Inspector general';
      case 'TEACHER_TUTOR':
        return 'Docente tutor';
      case 'WEEK_STUDENT':
        return 'Semanero';
      default:
        return signatureType;
    }
  }

  hasSignature(signatureType: string): boolean {
    return !!this.getSignature(signatureType);
  }

  getSignature(signatureType: string): DailyLogSignatureItem | undefined {
    return this.dailyLog?.signatures.find(signature => signature.signatureType === signatureType);
  }

  canOpenInspectorQr(): boolean {
    if (!this.dailyLog) {
      return false;
    }
    return this.hasSignature('TEACHER_TUTOR') && this.hasSignature('WEEK_STUDENT') && !this.hasSignature('GENERAL_INSPECTOR');
  }

  printDailyLog(): void {
    if (!this.dailyLog) {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) {
      this.errorMessage = 'No se pudo abrir la vista de impresion.';
      return;
    }

    const rows = this.dailyLog.entries.map((entry) => `
      <tr>
        <td>${entry.scheduleLabel}<br><small>${entry.startTime} - ${entry.endTime}</small></td>
        <td>${entry.subjectName ?? 'Sin asignatura'}<br><small>${entry.teacherName ?? 'Sin docente'}</small></td>
        <td>${entry.didacticUnit ?? ''}</td>
        <td>${entry.curricularSkill ?? ''}</td>
        <td>${entry.topic ?? ''}</td>
        <td>${entry.absences.map(absence => `${absence.enrollmentNumber} ${absence.studentName} (${this.absenceLabel(absence.absenceType)})`).join('<br>') || 'Sin inasistencias'}</td>
        <td>${entry.incidents.map(incident => `${incident.enrollmentNumber} ${incident.studentName}: ${incident.category} - ${incident.notes ?? ''}`).join('<br>') || 'Sin novedades'}</td>
        <td>${entry.generalNotes ?? ''}</td>
        <td>${entry.teacherSignatureStatus === 'SIGNED' ? `Cerrado<br><small>${entry.teacherClosedAt ?? ''}</small>` : 'Pendiente'}</td>
      </tr>
    `).join('');

    const finalSignatures = this.dailyLog.signatures.length > 0
      ? this.dailyLog.signatures.map(signature => `
        <div class="signature-box">
          <strong>${this.signatureLabel(signature.signatureType)}</strong><br>
          ${signature.signerName}<br>
          <small>${signature.signerRole}</small><br>
          <small>${signature.signedAt}</small>
          ${signature.notes ? `<div>${signature.notes}</div>` : ''}
        </div>
      `).join('')
      : '<div class="signature-box">Sin firmas finales registradas.</div>';

    printWindow.document.write(`
      <html>
        <head>
          <title>Leccionario ${this.dailyLog.courseName} ${this.dailyLog.logDate}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1, h2, h3, p { margin: 0 0 8px; }
            .meta { margin-bottom: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #444; padding: 8px; vertical-align: top; font-size: 12px; }
            th { background: #f2c230; }
            .signature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
            .signature-box { border: 1px solid #444; padding: 10px; min-height: 92px; }
          </style>
        </head>
        <body>
          <h1>Leccionario Digital</h1>
          <h2>${this.dailyLog.institutionName}</h2>
          <div class="meta">
            <p><strong>Curso:</strong> ${this.dailyLog.courseName}</p>
            <p><strong>Fecha:</strong> ${this.dailyLog.logDate}</p>
            <p><strong>Ciudad:</strong> ${this.dailyLog.city ?? 'No registrada'}</p>
            <p><strong>Estado:</strong> ${this.dailyLog.status}</p>
            <p><strong>Dia laborado:</strong> ${this.dailyLog.workDayNumber ?? ''}</p>
            <p><strong>Notas generales:</strong> ${this.dailyLog.generalNotes ?? 'Sin notas generales'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Asignatura</th>
                <th>Unidad didactica</th>
                <th>Destreza</th>
                <th>Tema</th>
                <th>Inasistencias</th>
                <th>Novedades</th>
                <th>Observaciones</th>
                <th>Cierre docente</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <h3 style="margin-top: 24px;">Firmas finales</h3>
          <div class="signature-grid">${finalSignatures}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private async openQrDialog(path: string): Promise<void> {
    this.qrTargetUrl = `${window.location.origin}${path}`;
    this.qrDataUrl = await QRCode.toDataURL(this.qrTargetUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#111111',
        light: '#ffffff'
      }
    });
    this.qrDialogOpen = true;
  }
}

type ScheduleOverview = {
  blocks: Array<{ id: number; label: string }>;
  schedules: Array<unknown>;
  courses: Array<{ id: number; name: string; parallel: string; level: string }>;
  periods: Array<{ id: number; name: string; startDate: string; endDate: string; active: boolean }>;
  subjects: Array<{ id: number; name: string; code: string; curriculumArea: string }>;
  teachers: Array<{ id: number; name: string; specialization: string }>;
};

type DailyLogItem = {
  id: number;
  courseId: number;
  courseName: string;
  periodId: number;
  periodName: string;
  institutionId: number;
  institutionName: string;
  workDayNumber: number | null;
  logDate: string;
  city: string | null;
  generalNotes: string | null;
  closeToken: string;
  status: string;
  closedAt: string | null;
  signatures: DailyLogSignatureItem[];
  students: DailyLogStudentItem[];
  entries: DailyLogEntryItem[];
};

type DailyLogEntryItem = {
  id: number;
  scheduleBlockId: number;
  scheduleLabel: string;
  blockType: 'CLASS' | 'RECESS';
  startTime: string;
  endTime: string;
  teacherId: number | null;
  teacherName: string | null;
  subjectId: number | null;
  subjectName: string | null;
  didacticUnit: string | null;
  curricularSkill: string | null;
  topic: string | null;
  closeToken: string;
  teacherSignatureStatus: 'PENDING' | 'SIGNED';
  teacherClosedAt: string | null;
  specificNotes: string | null;
  generalNotes: string | null;
  absences: DailyLogAbsenceItem[];
  incidents: DailyLogIncidentItem[];
  signed?: boolean;
};

type DailyLogStudentItem = {
  id: number;
  enrollmentNumber: string;
  fullName: string;
};

type DailyLogAbsenceItem = {
  id: number;
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  absenceType: string;
  notes: string | null;
};

type DailyLogAbsenceDraft = {
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  selected: boolean;
  absenceType: 'ABSENT' | 'LATE' | 'JUSTIFIED';
  notes: string;
};

type DailyLogIncidentItem = {
  id: number;
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  category: string;
  notes: string | null;
};

type DailyLogIncidentDraft = {
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  selected: boolean;
  category: string;
  notes: string;
};

type DailyLogSignatureItem = {
  id: number;
  signerName: string;
  signerRole: string;
  signatureType: string;
  signedAt: string;
  notes: string | null;
};
