import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-accounts-receivable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-cash-stack me-2"></i>Cuentas por Cobrar</h5>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm bg-danger text-white"><div class="card-body text-center"><div class="fs-4 fw-bold">{{ pendingCount }}</div><div class="small">Pendientes</div></div></div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm bg-warning text-dark"><div class="card-body text-center"><div class="fs-4 fw-bold">{{ partialCount }}</div><div class="small">Parciales</div></div></div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm bg-success text-white"><div class="card-body text-center"><div class="fs-4 fw-bold">\${{ totalPending | number:'1.2-2' }}</div><div class="small">Total Pendiente</div></div></div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Estudiante</th><th>Descripcion</th><th>Original</th><th>Pagado</th><th>Pendiente</th><th>Vence</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let ar of accountsReceivable">
                <td>{{ ar.studentId }}</td>
                <td>{{ ar.description }}</td>
                <td>\${{ ar.originalAmount | number:'1.2-2' }}</td>
                <td>\${{ ar.paidAmount | number:'1.2-2' }}</td>
                <td>\${{ (ar.originalAmount - ar.paidAmount) | number:'1.2-2' }}</td>
                <td>{{ ar.dueDate | date:'dd/MM/yyyy' }}</td>
                <td><span class="badge" [class.bg-warning]="ar.status==='PENDIENTE'" [class.bg-info]="ar.status==='PARCIAL'" [class.bg-success]="ar.status==='PAGADO'">{{ ar.status }}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-success" *ngIf="ar.status!=='PAGADO'" (click)="openPayModal(ar)"><i class="bi bi-cash"></i></button>
                  <button class="btn btn-sm btn-outline-primary ms-1" (click)="downloadStatement(ar.studentId)"><i class="bi bi-file-earmark-arrow-down"></i></button>
                </td>
              </tr>
              <tr *ngIf="accountsReceivable.length===0"><td colspan="8" class="text-center text-muted py-3">Sin cuentas por cobrar</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showPayModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Registrar Pago</h6></div>
          <div class="modal-body">
            <div class="mb-2"><strong>Pendiente:</strong> \${{ (selectedAR?.originalAmount - selectedAR?.paidAmount) | number:'1.2-2' }}</div>
            <label class="form-label small">Monto *</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="payAmount" step="0.01">
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
export class AccountsReceivableComponent implements OnInit {
  accountsReceivable: any[] = [];
  pendingCount = 0;
  partialCount = 0;
  totalPending = 0;
  showPayModal = false;
  selectedAR: any = null;
  payAmount = 0;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/finance/accounts-receivable/pending?institutionId=${this.instId}`).subscribe({
      next: r => {
        this.accountsReceivable = r;
        this.pendingCount = r.filter(a => a.status === 'PENDIENTE').length;
        this.partialCount = r.filter(a => a.status === 'PARCIAL').length;
        this.totalPending = r.reduce((sum, a) => sum + (a.originalAmount - a.paidAmount), 0);
      },
      error: () => {}
    });
  }

  openPayModal(ar: any) {
    this.selectedAR = ar;
    this.payAmount = ar.originalAmount - ar.paidAmount;
    this.showPayModal = true;
  }

  confirmPay() {
    this.http.post<any>(`${API_URL}/finance/accounts-receivable/${this.selectedAR.id}/payments`, { amount: this.payAmount }).subscribe({
      next: () => { this.showPayModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  downloadStatement(studentId: number) {
    window.open(`${API_URL}/finance/invoices/student/${studentId}/statement?institutionId=${this.instId}`, '_blank');
  }
}
