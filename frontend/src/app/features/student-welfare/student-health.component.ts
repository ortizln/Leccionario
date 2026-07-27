import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  selector: 'app-student-health',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Salud Estudiantil</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='summary'" (click)="tab='summary'; loadSummary()" role="button">Resumen</a></li>
      <li><a class="nav-link" [class.active]="tab==='record'" (click)="tab='record'; loadRecord()" role="button">Historial</a></li>
      <li><a class="nav-link" [class.active]="tab==='vaccines'" (click)="tab='vaccines'; loadVaccines()" role="button">Vacunas</a></li>
      <li><a class="nav-link" [class.active]="tab==='new-vacc'" (click)="tab='new-vacc'; resetVaccForm()" role="button">Nueva Vacuna</a></li>
    </ul>

    <div class="row g-2 mb-3">
      <div class="col-md-3"><label class="form-label form-label-sm">Estudiante ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="studentId" (change)="onStudentChange()"></div>
    </div>

    @if (tab === 'summary') {
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <i class="bi bi-droplet text-danger fs-2"></i>
              <div class="fs-4 fw-bold mt-1">{{ hr.bloodType || '-' }}</div>
              <div class="small text-muted">Tipo de Sangre</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <i class="bi bi-heart-pulse text-success fs-2"></i>
              <div class="fs-4 fw-bold mt-1">{{ hr.weightKg || '-' }} kg / {{ hr.heightCm || '-' }} cm</div>
              <div class="small text-muted">Peso / Altura</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <i class="bi bi-shield-check text-primary fs-2"></i>
              <div class="fs-5 fw-bold mt-1">{{ hr.insuranceProvider || 'Sin seguro' }}</div>
              <div class="small text-muted">Seguro #{{ hr.insuranceNumber || '-' }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Alergias</h6></div>
            <div class="card-body"><p class="mb-0 small">{{ hr.allergies || 'Sin alergias registradas' }}</p></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-capsule me-2"></i>Medicamentos</h6></div>
            <div class="card-body"><p class="mb-0 small">{{ hr.medications || 'Sin medicamentos' }}</p></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-clipboard-pulse me-2"></i>Condiciones Cronicas</h6></div>
            <div class="card-body"><p class="mb-0 small">{{ hr.chronicConditions || 'Sin condiciones' }}</p></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-telephone me-2"></i>Contacto de Emergencia</h6></div>
            <div class="card-body">
              <p class="mb-0 small">{{ hr.emergencyContact || 'No registrado' }}</p>
              <p class="mb-0 small text-muted" *ngIf="hr.doctorName">Doctor: {{ hr.doctorName }} ({{ hr.doctorPhone }})</p>
            </div>
          </div>
        </div>
        <div class="col-md-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-calendar-check me-2"></i>Vacunas ({{ vaccines.length }})</h6></div>
            <div class="card-body p-0">
              <table class="table table-sm mb-0">
                <thead class="table-light"><tr><th>Vacuna</th><th>Dosis</th><th>Fecha</th><th>Proxima</th><th>Estado</th></tr></thead>
                <tbody>
                  <tr *ngFor="let v of vaccines">
                    <td>{{ v.vaccineName }}</td><td>{{ v.doseNumber }}</td><td>{{ v.doseDate }}</td><td>{{ v.nextDoseDate || '-' }}</td>
                    <td><span class="badge" [class.bg-success]="v.status==='COMPLETADA'" [class.bg-warning]="v.status==='PENDIENTE'">{{ v.status }}</span></td>
                  </tr>
                  <tr *ngIf="vaccines.length===0"><td colspan="5" class="text-center text-muted py-2">Sin vacunas</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Historial de salud -->
    <div *ngIf="tab==='record'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-2"><label class="form-label form-label-sm">Tipo Sangre</label><input class="form-control form-control-sm" [(ngModel)]="hr.bloodType"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Peso (kg)</label><input type="number" class="form-control form-control-sm" [(ngModel)]="hr.weightKg"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Altura (cm)</label><input type="number" class="form-control form-control-sm" [(ngModel)]="hr.heightCm"></div>
            <div class="col-md-3"><label class="form-label form-label-sm">Alergias</label><input class="form-control form-control-sm" [(ngModel)]="hr.allergies"></div>
            <div class="col-md-3"><label class="form-label form-label-sm">Condiciones Cron.</label><input class="form-control form-control-sm" [(ngModel)]="hr.chronicConditions"></div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-4"><label class="form-label form-label-sm">Medicamentos</label><input class="form-control form-control-sm" [(ngModel)]="hr.medications"></div>
            <div class="col-md-3"><label class="form-label form-label-sm">Seguro</label><input class="form-control form-control-sm" [(ngModel)]="hr.insuranceProvider"></div>
            <div class="col-md-2"><label class="form-label form-label-sm"># Poliza</label><input class="form-control form-control-sm" [(ngModel)]="hr.insuranceNumber"></div>
            <div class="col-md-3"><label class="form-label form-label-sm">Contacto Emergencia</label><input class="form-control form-control-sm" [(ngModel)]="hr.emergencyContact"></div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-4"><label class="form-label form-label-sm">Doctor</label><input class="form-control form-control-sm" [(ngModel)]="hr.doctorName"></div>
            <div class="col-md-3"><label class="form-label form-label-sm">Tel. Doctor</label><input class="form-control form-control-sm" [(ngModel)]="hr.doctorPhone"></div>
          </div>
          <div class="mt-2"><button class="btn btn-sm btn-primary" (click)="saveRecord()">Guardar Historial</button></div>
        </div>
      </div>
    </div>

    <!-- Vacunas -->
    <div *ngIf="tab==='vaccines'">
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>Vacuna</th><th>Dosis</th><th>Fecha</th><th>Proxima</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let v of vaccines">
              <td>{{v.vaccineName}}</td><td>{{v.doseNumber}}</td><td>{{v.doseDate}}</td><td>{{v.nextDoseDate || '-'}}</td>
              <td><span class="badge" [class.text-bg-success]="v.status==='COMPLETADA'" [class.text-bg-warning]="v.status==='PENDIENTE'">{{v.status}}</span></td>
              <td><button class="btn btn-sm btn-outline-danger" (click)="deleteVacc(v.id)">X</button></td>
            </tr>
            <tr *ngIf="vaccines.length===0"><td colspan="6" class="text-muted text-center">No hay vacunas registradas</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Nueva vacuna -->
    <div *ngIf="tab==='new-vacc'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3"><label class="form-label form-label-sm">Vacuna</label><input class="form-control form-control-sm" [(ngModel)]="vf.vaccineName"></div>
            <div class="col-md-1"><label class="form-label form-label-sm"># Dosis</label><input type="number" class="form-control form-control-sm" [(ngModel)]="vf.doseNumber"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Fecha</label><input type="date" class="form-control form-control-sm" [(ngModel)]="vf.doseDate"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Proxima</label><input type="date" class="form-control form-control-sm" [(ngModel)]="vf.nextDoseDate"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Lote</label><input class="form-control form-control-sm" [(ngModel)]="vf.lotNumber"></div>
            <div class="col-md-2 d-flex align-items-end"><button class="btn btn-sm btn-primary" (click)="addVaccine()">Agregar</button></div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{message}}</div></div>
    </div>
  `
})
export class StudentHealthComponent implements OnInit {
  tab = 'record';
  studentId: number | null = null;
  hr: any = {};
  vaccines: any[] = [];
  vf: any = {};
  message = ''; isError = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  onStudentChange() { this.loadRecord(); this.loadVaccines(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  loadSummary() { this.loadRecord(); this.loadVaccines(); }

  loadRecord() {
    if (!this.studentId) return;
    this.http.get<any>(`${API_URL}/student-health/records/student/${this.studentId}`).subscribe({ next: d => { if (d) this.hr = d; } });
  }

  saveRecord() {
    if (!this.studentId) return;
    this.http.post(`${API_URL}/student-health/records`, { ...this.hr, studentId: this.studentId }).subscribe({
      next: () => this.showMsg('Guardado'), error: () => this.showMsg('Error', true)
    });
  }

  loadVaccines() {
    if (!this.studentId) return;
    this.http.get<any[]>(`${API_URL}/student-health/vaccinations/student/${this.studentId}`).subscribe({ next: d => this.vaccines = d });
  }

  addVaccine() {
    if (!this.studentId) return;
    this.http.post(`${API_URL}/student-health/vaccinations`, { ...this.vf, studentId: this.studentId }).subscribe({
      next: () => { this.showMsg('Vacuna agregada'); this.loadVaccines(); this.resetVaccForm(); }, error: () => this.showMsg('Error', true)
    });
  }

  deleteVacc(id: number) {
    this.http.delete(`${API_URL}/student-health/vaccinations/${id}`).subscribe({ next: () => this.loadVaccines() });
  }

  resetVaccForm() { this.vf = {}; }
}
