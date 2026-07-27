import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-student-insurance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-shield-check me-2"></i>Seguros Estudiantiles</h5>
      <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nuevo Seguro</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ total }}</div><div class="small">Total Seguros</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ active }}</div><div class="small">Activos</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ expiringSoon }}</div><div class="small">Por Vencer</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-danger text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ expired }}</div><div class="small">Vencidos</div></div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Estudiante</th><th>Aseguradora</th><th>Poliza</th><th>Inicio</th><th>Vence</th><th>Cobertura</th><th>Estado</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of insurances">
                <td>{{ s.studentId }}</td>
                <td>{{ s.insuranceProvider }}</td>
                <td>{{ s.policyNumber }}</td>
                <td>{{ s.startDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ s.endDate | date:'dd/MM/yyyy' }}</td>
                <td>\${{ s.coverageAmount | number:'1.2-2' }}</td>
                <td><span class="badge" [class.bg-success]="s.status==='ACTIVO'" [class.bg-warning]="s.status==='POR_VENCER'" [class.bg-danger]="s.status==='VENCIDO'">{{ s.status }}</span></td>
              </tr>
              <tr *ngIf="insurances.length===0"><td colspan="7" class="text-center text-muted py-3">Sin seguros registrados</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Nuevo Seguro</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label small">Estudiante ID *</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newInsurance.studentId"></div>
              <div class="col-md-6"><label class="form-label small">Aseguradora *</label><input class="form-control form-control-sm" [(ngModel)]="newInsurance.insuranceProvider"></div>
              <div class="col-md-6"><label class="form-label small">Poliza *</label><input class="form-control form-control-sm" [(ngModel)]="newInsurance.policyNumber"></div>
              <div class="col-md-6"><label class="form-label small">Cobertura</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newInsurance.coverageAmount" step="0.01"></div>
              <div class="col-md-6"><label class="form-label small">Inicio</label><input type="date" class="form-control form-control-sm" [(ngModel)]="newInsurance.startDate"></div>
              <div class="col-md-6"><label class="form-label small">Fin</label><input type="date" class="form-control form-control-sm" [(ngModel)]="newInsurance.endDate"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="create()">Crear</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentInsuranceComponent implements OnInit {
  insurances: any[] = [];
  total = 0;
  active = 0;
  expiringSoon = 0;
  expired = 0;
  showCreateModal = false;
  newInsurance: any = { studentId: null, insuranceProvider: '', policyNumber: '', coverageAmount: 0, startDate: '', endDate: '' };
  selectedStudentId = 1;
  students: any[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.loadStudents(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  loadStudents() {
    this.http.get<any[]>(`${API_URL}/bi/courses?institutionId=${this.instId}`).subscribe({
      next: r => {
        const allStudents: any[] = [];
        r.forEach((c: any) => {
          if (c.students) c.students.forEach((s: any) => allStudents.push(s));
        });
        this.students = allStudents.length ? allStudents : [];
        if (this.students.length) this.load();
      },
      error: () => this.load()
    });
  }

  load() {
    if (!this.selectedStudentId) return;
    this.http.get<any[]>(`${API_URL}/student-wellness/insurance/student/${this.selectedStudentId}`).subscribe({
      next: r => {
        this.insurances = r;
        this.total = r.length;
        this.active = r.filter(s => s.status === 'ACTIVO').length;
        this.expiringSoon = r.filter(s => s.status === 'POR_VENCER').length;
        this.expired = r.filter(s => s.status === 'VENCIDO').length;
      },
      error: () => {}
    });
  }

  create() {
    this.http.post<any>(`${API_URL}/student-wellness/insurance`, { ...this.newInsurance, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
