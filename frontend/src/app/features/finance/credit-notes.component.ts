import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-credit-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-journal-text me-2"></i>Notas de Credito</h5>
      <button class="btn btn-sm btn-primary" (click)="openForm()"><i class="bi bi-plus me-1"></i>Nueva Nota</button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr>
                <th>Num.</th>
                <th>Fecha</th>
                <th>Factura</th>
                <th>Motivo</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let n of notes">
                <td>{{ n.creditNumber }}</td>
                <td>{{ n.creditDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ n.invoiceId }}</td>
                <td>{{ n.reason }}</td>
                <td class="text-danger">\${{ n.amount | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [class.bg-success]="n.status==='APPLIED'" [class.bg-warning]="n.status==='PENDING'" [class.bg-secondary]="n.status==='CANCELLED'">
                    {{ n.status }}
                  </span>
                </td>
                <td>
                  <button *ngIf="n.status==='PENDING'" class="btn btn-sm btn-outline-success me-1" (click)="apply(n)" title="Aplicar">
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button *ngIf="n.status==='PENDING'" class="btn btn-sm btn-outline-danger" (click)="cancel(n)" title="Cancelar">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="notes.length===0"><td colspan="7" class="text-center text-muted py-4">Sin notas de credito</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div *ngIf="showForm" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Nueva Nota de Credito</h6></div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label small">Factura ID *</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="form.invoiceId" placeholder="ID de la factura acreditar">
            </div>
            <div class="mb-3">
              <label class="form-label small">Monto *</label>
              <input type="number" step="0.01" class="form-control form-control-sm" [(ngModel)]="form.amount" placeholder="0.00">
            </div>
            <div class="mb-3">
              <label class="form-label small">Motivo *</label>
              <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="form.reason" placeholder="Motivo de la nota de credito"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showForm=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="save()">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreditNotesComponent implements OnInit {
  notes: any[] = [];
  showForm = false;
  form = { invoiceId: null as number | null, amount: 0, reason: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/finance/credit-notes?institutionId=${this.instId}`).subscribe({
      next: r => this.notes = r,
      error: () => {}
    });
  }

  openForm() { this.form = { invoiceId: null, amount: 0, reason: '' }; this.showForm = true; }

  save() {
    if (!this.form.invoiceId || this.form.amount <= 0 || !this.form.reason) { alert('Complete todos los campos'); return; }
    this.http.post(`${API_URL}/finance/credit-notes?institutionId=${this.instId}`, {
      invoiceId: this.form.invoiceId, amount: this.form.amount, reason: this.form.reason
    }).subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }

  apply(n: any) {
    if (!confirm(`Aplicar nota de credito #${n.creditNumber} por $${n.amount}?`)) return;
    this.http.put(`${API_URL}/finance/credit-notes/${n.id}/apply`, {}).subscribe({ next: () => this.load(), error: e => alert(e.error?.message || 'Error') });
  }

  cancel(n: any) {
    if (!confirm(`Cancelar nota de credito #${n.creditNumber}?`)) return;
    this.http.put(`${API_URL}/finance/credit-notes/${n.id}/cancel`, {}).subscribe({ next: () => this.load(), error: e => alert(e.error?.message || 'Error') });
  }
}
