import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-cash-register me-2"></i>Caja</h5>
      <button class="btn btn-sm btn-success" *ngIf="!openRegister" (click)="showOpenModal=true">
        <i class="bi bi-plus-circle me-1"></i>Abrir Caja
      </button>
      <button class="btn btn-sm btn-danger" *ngIf="openRegister" (click)="closeCashRegister()">
        <i class="bi bi-lock me-1"></i>Cerrar Caja
      </button>
      <button class="btn btn-sm btn-outline-primary ms-1" *ngIf="openRegister" (click)="downloadDailyClose()">
        <i class="bi bi-file-earmark-pdf me-1"></i>Cierre PDF
      </button>
    </div>

    <div class="card border-0 shadow-sm mb-4" *ngIf="openRegister">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="text-muted small">Saldo Apertura</div>
            <div class="fs-5 fw-bold text-success">\${{ openRegister.openingBalance | number:'1.2-2' }}</div>
          </div>
          <div class="col-md-3">
            <div class="text-muted small">Ingresos</div>
            <div class="fs-5 fw-bold text-primary">\${{ openRegister.totalIncome | number:'1.2-2' }}</div>
          </div>
          <div class="col-md-3">
            <div class="text-muted small">Egresos</div>
            <div class="fs-5 fw-bold text-danger">\${{ openRegister.totalExpenses | number:'1.2-2' }}</div>
          </div>
          <div class="col-md-3">
            <div class="text-muted small">Balance Actual</div>
            <div class="fs-5 fw-bold">\${{ getCurrentBalance() | number:'1.2-2' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-4" *ngIf="openRegister">
      <div class="card-header bg-white"><h6 class="mb-0">Registrar Transaccion</h6></div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-2">
            <label class="form-label small">Tipo *</label>
            <select class="form-select form-select-sm" [(ngModel)]="newTx.transactionType">
              <option value="INGRESO">Ingreso</option>
              <option value="EGRESO">Egreso</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small">Categoria</label>
            <select class="form-select form-select-sm" [(ngModel)]="newTx.category">
              <option value="MATRICULA">Matricula</option>
              <option value="PENSION">Pension</option>
              <option value="UNIFORME">Uniforme</option>
              <option value="MATERIAL">Material</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small">Descripcion *</label>
            <input class="form-control form-control-sm" [(ngModel)]="newTx.description">
          </div>
          <div class="col-md-2">
            <label class="form-label small">Monto *</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="newTx.amount" step="0.01">
          </div>
          <div class="col-md-2">
            <label class="form-label small">Metodo</label>
            <select class="form-select form-select-sm" [(ngModel)]="newTx.paymentMethod">
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="TARJETA">Tarjeta</option>
            </select>
          </div>
          <div class="col-md-1 d-flex align-items-end">
            <button class="btn btn-sm btn-primary w-100" (click)="addTransaction()">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white d-flex justify-content-between">
        <h6 class="mb-0">Transacciones</h6>
        <div class="d-flex gap-2 align-items-center">
          <select class="form-select form-select-sm" [(ngModel)]="filterType" style="width:130px">
            <option value="ALL">Todos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="EGRESO">Egresos</option>
          </select>
          <select class="form-select form-select-sm" [(ngModel)]="filterMethod" style="width:140px">
            <option value="ALL">Todos Metodos</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="TARJETA">Tarjeta</option>
          </select>
          <span class="badge bg-secondary">{{ filteredTransactions().length }}</span>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Fecha</th><th>Tipo</th><th>Categoria</th><th>Descripcion</th><th>Monto</th><th>Metodo</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of filteredTransactions()">
                <td>{{ t.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                <td><span class="badge" [class.bg-success]="t.transactionType==='INGRESO'" [class.bg-danger]="t.transactionType==='EGRESO'">{{ t.transactionType }}</span></td>
                <td>{{ t.category }}</td>
                <td>{{ t.description }}</td>
                <td [class.text-success]="t.transactionType==='INGRESO'" [class.text-danger]="t.transactionType==='EGRESO'">
                  {{ t.transactionType==='INGRESO' ? '+' : '-' }}\${{ t.amount | number:'1.2-2' }}
                </td>
                <td><span class="badge bg-light text-dark">{{ t.paymentMethod }}</span></td>
              </tr>
              <tr *ngIf="filteredTransactions().length===0"><td colspan="6" class="text-center text-muted py-3">Sin transacciones</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-white d-flex justify-content-between small">
        <span>Ingresos: <strong class="text-success">\${{ getTotalIncome() | number:'1.2-2' }}</strong></span>
        <span>Egresos: <strong class="text-danger">\${{ getTotalExpenses() | number:'1.2-2' }}</strong></span>
        <span>Balance: <strong>\${{ getCurrentBalance() | number:'1.2-2' }}</strong></span>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showOpenModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Abrir Caja</h6></div>
          <div class="modal-body">
            <label class="form-label small">Saldo de Apertura</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="openingBalance" step="0.01">
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showOpenModal=false">Cancelar</button>
            <button class="btn btn-sm btn-success" (click)="confirmOpen()">Abrir</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CashierComponent implements OnInit {
  openRegister: any = null;
  transactions: any[] = [];
  showOpenModal = false;
  openingBalance = 0;
  filterType = 'ALL';
  filterMethod = 'ALL';
  newTx: any = { transactionType: 'INGRESO', category: 'MATRICULA', description: '', amount: 0, paymentMethod: 'EFECTIVO' };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.loadOpen(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadOpen() {
    this.http.get<any>(`${API_URL}/finance/cash-registers/open?institutionId=${this.instId}`).subscribe({
      next: r => { this.openRegister = r; if (r) this.loadTx(r.id); },
      error: () => {}
    });
  }

  loadTx(registerId: number) {
    this.http.get<any[]>(`${API_URL}/finance/cash-registers/${registerId}/transactions`).subscribe({
      next: r => this.transactions = r,
      error: () => {}
    });
  }

  filteredTransactions() {
    let items = this.transactions;
    if (this.filterType !== 'ALL') items = items.filter(t => t.transactionType === this.filterType);
    if (this.filterMethod !== 'ALL') items = items.filter(t => t.paymentMethod === this.filterMethod);
    return items;
  }

  getTotalIncome() { return this.transactions.filter(t => t.transactionType === 'INGRESO').reduce((s, t) => s + (t.amount || 0), 0); }
  getTotalExpenses() { return this.transactions.filter(t => t.transactionType === 'EGRESO').reduce((s, t) => s + (t.amount || 0), 0); }
  getCurrentBalance() {
    if (!this.openRegister) return 0;
    return this.openRegister.openingBalance + this.openRegister.totalIncome - this.openRegister.totalExpenses;
  }

  confirmOpen() {
    this.http.post<any>(`${API_URL}/finance/cash-registers`, { institutionId: this.instId, openingBalance: this.openingBalance }).subscribe({
      next: r => { this.openRegister = r; this.showOpenModal = false; this.transactions = []; },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  closeCashRegister() {
    const closing = this.getCurrentBalance();
    this.http.post<any>(`${API_URL}/finance/cash-registers/${this.openRegister.id}/close`, { closedBy: 'admin', closingBalance: closing }).subscribe({
      next: () => { this.openRegister = null; this.transactions = []; },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  downloadDailyClose() {
    window.open(`${API_URL}/finance/cash-registers/${this.openRegister.id}/daily-close`, '_blank');
  }

  addTransaction() {
    if (!this.newTx.description || !this.newTx.amount) return;
    this.http.post<any>(`${API_URL}/finance/cash-registers/transactions`, { ...this.newTx, registerId: this.openRegister.id }).subscribe({
      next: () => { this.loadTx(this.openRegister.id); this.newTx = { transactionType: 'INGRESO', category: 'MATRICULA', description: '', amount: 0, paymentMethod: 'EFECTIVO' }; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
