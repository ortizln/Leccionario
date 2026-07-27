import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-cash-stack me-2"></i>Nomina y Sueldos</h5>
      <div class="d-flex gap-2">
        <select class="form-select form-select-sm" [(ngModel)]="tab" style="width:auto">
          <option value="payrolls">Nominas</option>
          <option value="entries" *ngIf="selectedPayroll">Detalle</option>
        </select>
        <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nueva Nomina</button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.total }}</div><div class="small">Nominas</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.approved }}</div><div class="small">Aprobadas</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.pending }}</div><div class="small">Borradores</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">\${{ totalNet | number:'1.2-2' }}</div><div class="small">Total Neto</div></div>
        </div>
      </div>
    </div>

    @if (tab === 'payrolls') {
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Periodo</th><th>Inicio</th><th>Fin</th><th>Bruto</th><th>Deducciones</th><th>Neto</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of payrolls">
                  <td class="fw-semibold">{{ p.period }}</td>
                  <td>{{ p.periodStart | date:'dd/MM/yyyy' }}</td>
                  <td>{{ p.periodEnd | date:'dd/MM/yyyy' }}</td>
                  <td>\${{ p.totalGross | number:'1.2-2' }}</td>
                  <td class="text-danger">\${{ p.totalDeductions | number:'1.2-2' }}</td>
                  <td class="text-success">\${{ p.totalNet | number:'1.2-2' }}</td>
                  <td><span class="badge" [class.bg-secondary]="p.status==='BORRADOR'" [class.bg-success]="p.status==='APROBADO'" [class.bg-info]="p.status==='PAGADO'">{{ p.status }}</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" (click)="viewPayroll(p)" title="Ver detalle"><i class="bi bi-eye"></i></button>
                    <button *ngIf="p.status==='BORRADOR'" class="btn btn-sm btn-outline-success" (click)="approve(p)" title="Aprobar"><i class="bi bi-check-circle"></i></button>
                  </td>
                </tr>
                <tr *ngIf="payrolls.length===0"><td colspan="8" class="text-center text-muted py-4">Sin nominas</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'entries' && selectedPayroll) {
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Detalle: {{ selectedPayroll.period }}</h6>
          <button class="btn btn-sm btn-primary" (click)="showEntryModal=true"><i class="bi bi-plus me-1"></i>Agregar Empleado</button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Empleado ID</th><th>Salario Base</th><th>Horas Extra</th><th>Bonos</th><th>Bruto</th><th>IESS</th><th>Prestamos</th><th>Otros</th><th>Total Deduc.</th><th>Neto</th><th></th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let e of entries">
                  <td>{{ e.employeeId }}</td>
                  <td>\${{ e.baseSalary | number:'1.2-2' }}</td>
                  <td>{{ e.overtimeHours }}h</td>
                  <td>\${{ e.overtimeAmount | number:'1.2-2' }}</td>
                  <td>\${{ e.bonusAmount | number:'1.2-2' }}</td>
                  <td class="text-success fw-semibold">\${{ e.grossSalary | number:'1.2-2' }}</td>
                  <td class="text-danger">\${{ e.iessDeduction | number:'1.2-2' }}</td>
                  <td>\${{ e.loanDeduction | number:'1.2-2' }}</td>
                  <td>\${{ e.otherDeductions | number:'1.2-2' }}</td>
                  <td class="text-danger">\${{ e.totalDeductions | number:'1.2-2' }}</td>
                  <td class="text-success fw-bold">\${{ e.netSalary | number:'1.2-2' }}</td>
                  <td><button class="btn btn-sm btn-outline-danger" (click)="removeEntry(e.id)" title="Eliminar"><i class="bi bi-trash"></i></button></td>
                </tr>
                <tr *ngIf="entries.length===0"><td colspan="11" class="text-center text-muted py-3">Sin empleados en esta nomina</td></tr>
                <tr class="table-light fw-bold">
                  <td colspan="4">TOTALES</td>
                  <td>\${{ selectedPayroll.totalGross | number:'1.2-2' }}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-danger">\${{ selectedPayroll.totalDeductions | number:'1.2-2' }}</td>
                  <td class="text-success">\${{ selectedPayroll.totalNet | number:'1.2-2' }}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Nueva Nomina</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small">Periodo *</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="form.period" placeholder="Ej: Enero 2026">
              </div>
              <div class="col-md-6">
                <label class="form-label small">Notas</label>
                <input class="form-control form-control-sm" [(ngModel)]="form.notes">
              </div>
              <div class="col-md-6">
                <label class="form-label small">Fecha Inicio *</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="form.periodStart">
              </div>
              <div class="col-md-6">
                <label class="form-label small">Fecha Fin *</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="form.periodEnd">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="createPayroll()">Crear</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showEntryModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Agregar Empleado a Nomina</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small">Empleado ID *</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="entryForm.employeeId">
              </div>
              <div class="col-md-6">
                <label class="form-label small">Salario Base</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="entryForm.baseSalary" step="0.01" placeholder="Se obtiene del contrato">
              </div>
              <div class="col-md-4">
                <label class="form-label small">Horas Extra</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="entryForm.overtimeHours" step="0.5">
              </div>
              <div class="col-md-4">
                <label class="form-label small">Monto Extra</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="entryForm.overtimeAmount" step="0.01">
              </div>
              <div class="col-md-4">
                <label class="form-label small">Bonos</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="entryForm.bonusAmount" step="0.01">
              </div>
              <div class="col-md-4">
                <label class="form-label small">Prestamos</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="entryForm.loanDeduction" step="0.01">
              </div>
              <div class="col-md-4">
                <label class="form-label small">Otras Deducciones</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="entryForm.otherDeductions" step="0.01">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showEntryModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="addEntry()">Agregar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PayrollComponent implements OnInit {
  tab = 'payrolls';
  payrolls: any[] = [];
  entries: any[] = [];
  selectedPayroll: any = null;
  stats = { total: 0, approved: 0, pending: 0 };
  totalNet = 0;
  showCreateModal = false;
  showEntryModal = false;
  form = { period: '', periodStart: '', periodEnd: '', notes: '' };
  entryForm: any = { employeeId: null, baseSalary: null, overtimeHours: 0, overtimeAmount: 0, bonusAmount: 0, loanDeduction: 0, otherDeductions: 0 };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/payrolls?institutionId=${this.instId}`).subscribe({
      next: r => { this.payrolls = r; this.totalNet = r.reduce((s, p) => s + (p.totalNet || 0), 0); },
      error: () => {}
    });
    this.http.get<any>(`${API_URL}/hr/payrolls/stats?institutionId=${this.instId}`).subscribe({
      next: r => this.stats = r,
      error: () => {}
    });
  }

  createPayroll() {
    if (!this.form.period || !this.form.periodStart || !this.form.periodEnd) { alert('Complete los campos obligatorios'); return; }
    this.http.post(`${API_URL}/hr/payrolls`, { ...this.form, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  viewPayroll(p: any) {
    this.selectedPayroll = p;
    this.tab = 'entries';
    this.http.get<any[]>(`${API_URL}/hr/payrolls/${p.id}/entries`).subscribe({
      next: r => this.entries = r,
      error: () => this.entries = []
    });
  }

  addEntry() {
    if (!this.entryForm.employeeId) { alert('Ingrese el ID del empleado'); return; }
    this.http.post(`${API_URL}/hr/payrolls/${this.selectedPayroll.id}/entries`, this.entryForm).subscribe({
      next: () => {
        this.showEntryModal = false;
        this.entryForm = { employeeId: null, baseSalary: null, overtimeHours: 0, overtimeAmount: 0, bonusAmount: 0, loanDeduction: 0, otherDeductions: 0 };
        this.viewPayroll(this.selectedPayroll);
        this.load();
      },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  removeEntry(entryId: number) {
    if (!confirm('Eliminar esta entrada?')) return;
    this.http.delete(`${API_URL}/hr/payrolls/entries/${entryId}`).subscribe({
      next: () => { this.viewPayroll(this.selectedPayroll); this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  approve(p: any) {
    if (!confirm(`Aprobar nomina "${p.period}"?`)) return;
    this.http.put(`${API_URL}/hr/payrolls/${p.id}/status?status=APROBADO`, {}).subscribe({
      next: () => this.load(),
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
