import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-tuition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-wallet2 me-2"></i>Pensiones y Planes</h5>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='plans'" (click)="tab='plans'" role="button">Planes</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='students'" (click)="tab='students'" role="button">Asignaciones</a></li>
    </ul>

    @if (tab === 'plans') {
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-sm btn-primary" (click)="showPlanModal=true"><i class="bi bi-plus-circle me-1"></i>Nuevo Plan</button>
      </div>
      <div class="row g-3">
        <div class="col-md-4" *ngFor="let plan of plans">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <h6 class="mb-1">{{ plan.name }}</h6>
                <span class="badge" [class.bg-success]="plan.active" [class.bg-secondary]="!plan.active">{{ plan.active ? 'Activo' : 'Inactivo' }}</span>
              </div>
              <p class="text-muted small mb-2">{{ plan.description }}</p>
              <div class="fs-5 fw-bold text-primary">\${{ plan.amount | number:'1.2-2' }}</div>
              <div class="small text-muted">{{ plan.category }}</div>
              <div class="mt-2"><button class="btn btn-sm btn-outline-danger" (click)="deletePlan(plan.id)"><i class="bi bi-trash"></i></button></div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'students') {
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Estudiante</th><th>Plan</th><th>Total</th><th>Pagado</th><th>Pendiente</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let st of studentTuitions">
                  <td>{{ st.studentId }}</td>
                  <td>{{ st.planName }}</td>
                  <td>\${{ st.totalAmount | number:'1.2-2' }}</td>
                  <td>\${{ st.paidAmount | number:'1.2-2' }}</td>
                  <td>\${{ (st.totalAmount - st.paidAmount) | number:'1.2-2' }}</td>
                  <td><span class="badge" [class.bg-success]="st.status==='PAGADA'" [class.bg-warning]="st.status==='ACTIVA'">{{ st.status }}</span></td>
                  <td><button class="btn btn-sm btn-outline-success" *ngIf="st.status!=='PAGADA'" (click)="openPayModal(st)"><i class="bi bi-cash"></i></button></td>
                </tr>
                <tr *ngIf="studentTuitions.length===0"><td colspan="7" class="text-center text-muted py-3">Sin asignaciones</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    <div class="modal d-block" *ngIf="showPlanModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Nuevo Plan de Pago</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label small">Nombre *</label><input class="form-control form-control-sm" [(ngModel)]="newPlan.name"></div>
              <div class="col-md-6"><label class="form-label small">Monto *</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newPlan.amount" step="0.01"></div>
              <div class="col-12"><label class="form-label small">Descripcion</label><textarea class="form-control form-control-sm" [(ngModel)]="newPlan.description" rows="2"></textarea></div>
              <div class="col-md-6"><label class="form-label small">Categoria</label>
                <select class="form-select form-select-sm" [(ngModel)]="newPlan.category">
                  <option value="MATRICULA">Matricula</option>
                  <option value="PENSION">Pension</option>
                  <option value="UNIFORME">Uniforme</option>
                  <option value="MATERIAL">Material</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showPlanModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="createPlan()">Crear</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showPayModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Registrar Pago</h6></div>
          <div class="modal-body">
            <div class="mb-2"><strong>Pendiente:</strong> \${{ (selectedTuition?.totalAmount - selectedTuition?.paidAmount) | number:'1.2-2' }}</div>
            <label class="form-label small">Monto *</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="payAmount" step="0.01">
            <label class="form-label small mt-2">Metodo</label>
            <select class="form-select form-select-sm" [(ngModel)]="payMethod">
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showPayModal=false">Cancelar</button>
            <button class="btn btn-sm btn-success" (click)="confirmPay()">Pagar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TuitionComponent implements OnInit {
  tab = 'plans';
  plans: any[] = [];
  studentTuitions: any[] = [];
  showPlanModal = false;
  showPayModal = false;
  newPlan: any = { name: '', description: '', amount: 0, ivaIncluded: true, category: 'PENSION' };
  selectedTuition: any = null;
  payAmount = 0;
  payMethod = 'EFECTIVO';
  selectedPeriodId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.loadPlans(); this.loadStudentTuitions(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadPlans() {
    this.http.get<any[]>(`${API_URL}/finance/tuitions/plans?institutionId=${this.instId}`).subscribe({ next: r => this.plans = r, error: () => {} });
  }

  loadStudentTuitions() {
    this.http.get<any[]>(`${API_URL}/finance/tuitions/period/${this.selectedPeriodId}`).subscribe({ next: r => this.studentTuitions = r, error: () => {} });
  }

  createPlan() {
    this.http.post<any>(`${API_URL}/finance/tuitions/plans`, { ...this.newPlan, institutionId: this.instId }).subscribe({
      next: () => { this.showPlanModal = false; this.loadPlans(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  deletePlan(id: number) {
    if (!confirm('Eliminar plan?')) return;
    this.http.delete(`${API_URL}/finance/tuitions/plans/${id}`).subscribe({ next: () => this.loadPlans() });
  }

  openPayModal(st: any) {
    this.selectedTuition = st;
    this.payAmount = st.totalAmount - st.paidAmount;
    this.showPayModal = true;
  }

  confirmPay() {
    this.http.post<any>(`${API_URL}/finance/tuitions/${this.selectedTuition.id}/payments`, { amount: this.payAmount, paymentMethod: this.payMethod }).subscribe({
      next: () => { this.showPayModal = false; this.loadStudentTuitions(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
