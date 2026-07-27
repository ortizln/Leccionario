import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  selector: 'app-student-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-person-check me-2"></i>Seguimiento Estudiantil</h5>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <label class="form-label small">ID Estudiante *</label>
        <input type="number" class="form-control form-control-sm" [(ngModel)]="studentId" (change)="loadAll()">
      </div>
    </div>

    @if (studentId) {
      <div class="row g-3 mb-4">
        <div class="col-md-2">
          <div class="card border-0 shadow-sm bg-primary text-white text-center">
            <div class="card-body py-2"><div class="fs-4 fw-bold">{{ grades.length }}</div><div class="small">Calificaciones</div></div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card border-0 shadow-sm bg-success text-white text-center">
            <div class="card-body py-2"><div class="fs-4 fw-bold">{{ avgGrade | number:'1.1-1' }}</div><div class="small">Promedio</div></div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card border-0 shadow-sm bg-danger text-white text-center">
            <div class="card-body py-2"><div class="fs-4 fw-bold">{{ absences }}</div><div class="small">Inasistencias</div></div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card border-0 shadow-sm bg-warning text-dark text-center">
            <div class="card-body py-2"><div class="fs-4 fw-bold">{{ merits }}</div><div class="small">Meritos</div></div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card border-0 shadow-sm bg-info text-white text-center">
            <div class="card-body py-2"><div class="fs-4 fw-bold">{{ loans.length }}</div><div class="small">Libros</div></div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card border-0 shadow-sm" [class.bg-success]="!riskLevel" [class.bg-danger]="riskLevel">
            <div class="card-body text-white text-center">
              <div class="fs-5 fw-bold">{{ riskLevel ? riskLevel : 'OK' }}</div>
              <div class="small">Riesgo</div>
            </div>
          </div>
        </div>
      </div>

      <ul class="nav nav-tabs mb-3">
        <li class="nav-item"><a class="nav-link" [class.active]="tab==='grades'" (click)="tab='grades'" role="button">Calificaciones</a></li>
        <li class="nav-item"><a class="nav-link" [class.active]="tab==='attendance'" (click)="tab='attendance'" role="button">Asistencia</a></li>
        <li class="nav-item"><a class="nav-link" [class.active]="tab==='conduct'" (click)="tab='conduct'" role="button">Conducta</a></li>
        <li class="nav-item"><a class="nav-link" [class.active]="tab==='health'" (click)="tab='health'" role="button">Salud</a></li>
        <li class="nav-item"><a class="nav-link" [class.active]="tab==='library'" (click)="tab='library'" role="button">Biblioteca</a></li>
      </ul>

      @if (tab === 'grades') {
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0">Historial de Calificaciones</h6></div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light">
                  <tr><th>Materia</th><th>Periodo</th><th>Calificacion</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let g of grades">
                    <td>{{ g.subjectName || 'Materia #'+g.subjectId }}</td>
                    <td>{{ g.periodName || g.periodId }}</td>
                    <td class="fw-semibold" [class.text-success]="g.score>=7" [class.text-warning]="g.score>=5" [class.text-danger]="g.score<5">{{ g.score | number:'1.1-1' }}</td>
                    <td><span class="badge" [class.bg-success]="g.score>=7" [class.bg-warning]="g.score>=5" [class.bg-danger]="g.score<5">{{ g.score>=7 ? 'Aprobado' : g.score>=5 ? 'Supletorio' : 'Reprobado' }}</span></td>
                  </tr>
                  <tr *ngIf="grades.length===0"><td colspan="4" class="text-center text-muted py-3">Sin calificaciones</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      @if (tab === 'attendance') {
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0">Registro de Asistencia</h6></div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light">
                  <tr><th>Fecha</th><th>Estado</th><th>Justificacion</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let a of attendance">
                    <td>{{ a.logDate || a.date }}</td>
                    <td><span class="badge" [class.bg-success]="a.absenceType==='ASISTENCIA'" [class.bg-danger]="a.absenceType==='INASISTENCIA'" [class.bg-warning]="a.absenceType==='TARDANZA'" [class.bg-info]="a.absenceType==='JUSTIFICADO'">{{ a.absenceType }}</span></td>
                    <td class="small">{{ a.justification || '-' }}</td>
                  </tr>
                  <tr *ngIf="attendance.length===0"><td colspan="3" class="text-center text-muted py-3">Sin registros de asistencia</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      @if (tab === 'conduct') {
        <div class="row g-3">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white"><h6 class="mb-0 text-success"><i class="bi bi-star me-2"></i>Meritos</h6></div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <div class="list-group-item" *ngFor="let m of meritList">
                    <div class="d-flex justify-content-between">
                      <span>{{ m.description || m.meritTypeName }}</span>
                      <small class="text-muted">{{ m.awardDate }}</small>
                    </div>
                  </div>
                  <div *ngIf="meritList.length===0" class="text-center text-muted py-3 small">Sin meritos</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white"><h6 class="mb-0 text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Demeritos</h6></div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <div class="list-group-item" *ngFor="let d of demeritList">
                    <div class="d-flex justify-content-between">
                      <span>{{ d.description }}</span>
                      <small class="text-muted">{{ d.infractionDate }}</small>
                    </div>
                  </div>
                  <div *ngIf="demeritList.length===0" class="text-center text-muted py-3 small">Sin demeritos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      @if (tab === 'health') {
        <div class="row g-3">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-clipboard-pulse me-2"></i>Historial de Salud</h6></div>
              <div class="card-body">
                <div class="row g-2">
                  <div class="col-6"><span class="small text-muted">Tipo Sangre:</span> <strong>{{ health.bloodType || '-' }}</strong></div>
                  <div class="col-6"><span class="small text-muted">Peso:</span> <strong>{{ health.weightKg || '-' }} kg</strong></div>
                  <div class="col-6"><span class="small text-muted">Altura:</span> <strong>{{ health.heightCm || '-' }} cm</strong></div>
                  <div class="col-6"><span class="small text-muted">Seguro:</span> <strong>{{ health.insuranceProvider || '-' }}</strong></div>
                  <div class="col-12"><span class="small text-muted">Alergias:</span> <strong>{{ health.allergies || 'Ninguna' }}</strong></div>
                  <div class="col-12"><span class="small text-muted">Medicamentos:</span> <strong>{{ health.medications || 'Ninguno' }}</strong></div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-capsule me-2"></i>Vacunas</h6></div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-sm mb-0">
                    <thead class="table-light"><tr><th>Vacuna</th><th>Dosis</th><th>Fecha</th><th>Estado</th></tr></thead>
                    <tbody>
                      <tr *ngFor="let v of vaccinations">
                        <td>{{ v.vaccineName }}</td><td>{{ v.doseNumber }}</td><td>{{ v.doseDate }}</td>
                        <td><span class="badge" [class.bg-success]="v.status==='COMPLETADA'" [class.bg-warning]="v.status==='PENDIENTE'">{{ v.status }}</span></td>
                      </tr>
                      <tr *ngIf="vaccinations.length===0"><td colspan="4" class="text-center text-muted py-2">Sin vacunas</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      @if (tab === 'library') {
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-book me-2"></i>Prestamos de Biblioteca</h6></div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light">
                  <tr><th>Libro</th><th>Prestamo</th><th>Vence</th><th>Devolucion</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let l of loans">
                    <td>Libro #{{ l.bookId }}</td>
                    <td>{{ l.loanDate }}</td>
                    <td>{{ l.dueDate }}</td>
                    <td>{{ l.returnDate || '-' }}</td>
                    <td><span class="badge" [class.bg-success]="l.status==='DEVUELTO'" [class.bg-warning]="l.status==='ACTIVO'" [class.bg-danger]="l.status==='VENCIDO'">{{ l.status }}</span></td>
                  </tr>
                  <tr *ngIf="loans.length===0"><td colspan="5" class="text-center text-muted py-3">Sin prestamos</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    } @else {
      <div class="text-center text-muted py-5">
        <i class="bi bi-person-search fs-1"></i>
        <p class="mt-2">Ingrese el ID de un estudiante para ver su seguimiento</p>
      </div>
    }
  `
})
export class StudentTrackingComponent implements OnInit {
  studentId: number | null = null;
  tab = 'grades';
  grades: any[] = [];
  attendance: any[] = [];
  meritList: any[] = [];
  demeritList: any[] = [];
  health: any = {};
  vaccinations: any[] = [];
  loans: any[] = [];
  avgGrade = 0;
  absences = 0;
  merits = 0;
  riskLevel = '';

  constructor(private http: HttpClient) {}
  ngOnInit() {}

  loadAll() {
    if (!this.studentId) return;
    this.http.get<any[]>(`${API_URL}/grading/student/${this.studentId}`).subscribe({
      next: r => { this.grades = r; this.avgGrade = r.length ? r.reduce((s, g) => s + (g.averageScore || 0), 0) / r.length : 0; this.checkRisk(); },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/attendance/student/${this.studentId}`).subscribe({
      next: r => { this.attendance = r; this.absences = r.filter((a: any) => a.absenceType === 'INASISTENCIA').length; this.checkRisk(); },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/conduct/merits/student/${this.studentId}`).subscribe({
      next: r => { this.meritList = r; this.merits = r.length; },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/student-demers/by-student/${this.studentId}`).subscribe({
      next: r => this.demeritList = r,
      error: () => {}
    });
    this.http.get<any>(`${API_URL}/student-health/records/student/${this.studentId}`).subscribe({
      next: r => this.health = r || {},
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/student-health/vaccinations/student/${this.studentId}`).subscribe({
      next: r => this.vaccinations = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/library/loans/student/${this.studentId}`).subscribe({
      next: r => this.loans = r,
      error: () => {}
    });
  }

  checkRisk() {
    if (this.avgGrade < 5 || this.absences > 5) this.riskLevel = 'ALTO';
    else if (this.avgGrade < 7 || this.absences > 3) this.riskLevel = 'MEDIO';
    else this.riskLevel = '';
  }
}
