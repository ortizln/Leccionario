import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-account-statements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-file-earmark-text me-2"></i>Estados de Cuenta</h5>
    </div>

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <label class="form-label form-label-sm">Estudiante ID</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="studentId" placeholder="ID del estudiante">
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary btn-sm" (click)="loadStatement()"><i class="bi bi-search me-1"></i>Consultar</button>
          </div>
        </div>
      </div>
    </div>

    @if (statement) {
      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-primary text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ statement.totalDebt | number:'1.2-2' }}</div><div class="small">Deuda Total</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-success text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ statement.totalPaid | number:'1.2-2' }}</div><div class="small">Total Pagado</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-warning text-dark text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ statement.balance | number:'1.2-2' }}</div><div class="small">Saldo Pendiente</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-danger text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">{{ statement.overdueCount }}</div><div class="small">Vencidos</div></div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-header py-2"><h6 class="mb-0">Detalle de Cuentas por Cobrar</h6></div>
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Descripcion</th><th>Monto Original</th><th>Pagado</th><th>Saldo</th><th>Fecha Venc.</th><th>Estado</th></tr></thead>
            <tbody>
              <tr *ngFor="let item of statement.items">
                <td>{{ item.description }}</td>
                <td>\${{ item.originalAmount | number:'1.2-2' }}</td>
                <td>\${{ item.paidAmount | number:'1.2-2' }}</td>
                <td class="fw-bold">\${{ item.originalAmount - item.paidAmount | number:'1.2-2' }}</td>
                <td>{{ item.dueDate | date:'dd/MM/yyyy' }}</td>
                <td><span class="badge" [class.bg-success]="item.status==='PAGADO'" [class.bg-warning]="item.status==='PENDIENTE'" [class.bg-danger]="item.status==='VENCIDO'">{{ item.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class AccountStatementsComponent implements OnInit {
  studentId: number | null = null;
  statement: any = null;
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {}

  loadStatement() {
    if (!this.studentId) return;
    this.http.get<any[]>(`${API_URL}/finance/accounts-receivable/student/${this.studentId}`).subscribe({
      next: (items: any[]) => {
        const totalDebt = items.reduce((s: number, i: any) => s + (i.originalAmount - (i.paidAmount || 0)), 0);
        const totalPaid = items.reduce((s: number, i: any) => s + (i.paidAmount || 0), 0);
        const balance = totalDebt;
        const overdueCount = items.filter((i: any) => i.status === 'VENCIDO').length;
        this.statement = { totalDebt, totalPaid, balance, overdueCount, items };
      },
      error: () => { this.statement = null; }
    });
  }
}
