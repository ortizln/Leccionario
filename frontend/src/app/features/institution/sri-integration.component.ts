import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  selector: 'app-sri-integration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-3">
      <h5 class="mb-3"><i class="bi bi-file-earmark-check me-2"></i>SRI - Integracion Tributaria</h5>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">Validar Documento Tributario</div>
            <div class="card-body">
              <div class="mb-2">
                <label class="form-label form-label-sm">RUC Emisor</label>
                <input class="form-control form-control-sm" [(ngModel)]="rucEmisor" placeholder="1790000000001">
              </div>
              <div class="mb-2">
                <label class="form-label form-label-sm">Clave de Acceso</label>
                <input class="form-control form-control-sm" [(ngModel)]="claveAcceso" placeholder="12345678901234567890123456">
              </div>
              <button class="btn btn-sm btn-primary" (click)="validateDocument()" [disabled]="loading">Validar</button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">Consultar Estado de Comprobante</div>
            <div class="card-body">
              <div class="mb-2">
                <label class="form-label form-label-sm">Clave de Acceso</label>
                <input class="form-control form-control-sm" [(ngModel)]="statusClave" placeholder="Clave de acceso">
              </div>
              <button class="btn btn-sm btn-primary" (click)="queryStatus()" [disabled]="loading">Consultar</button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="result" class="card mb-3">
        <div class="card-header">Resultado</div>
        <div class="card-body">
          <table class="table table-sm table-bordered mb-0">
            <tr *ngFor="let entry of resultEntries"><td class="fw-bold">{{ entry.key }}</td><td>{{ entry.value }}</td></tr>
          </table>
        </div>
      </div>

      <div *ngIf="message" class="alert" [class.alert-success]="messageType==='ok'" [class.alert-danger]="messageType==='error'">
        {{ message }}
      </div>
    </div>
  `
})
export class SriIntegrationComponent {
  rucEmisor = '';
  claveAcceso = '';
  statusClave = '';
  loading = false;
  result: any = null;
  resultEntries: { key: string; value: string }[] = [];
  message = '';
  messageType = 'ok';

  constructor(private http: HttpClient) {}

  validateDocument() {
    this.loading = true;
    this.message = '';
    this.http.post<any>(`${API_URL}/sri/validate?rucEmisor=${this.rucEmisor}&claveAcceso=${this.claveAcceso}`, {}).subscribe({
      next: (data) => { this.setResult(data); this.loading = false; },
      error: () => { this.message = 'Error al validar documento'; this.messageType = 'error'; this.loading = false; }
    });
  }

  queryStatus() {
    this.loading = true;
    this.message = '';
    this.http.get<any>(`${API_URL}/sri/status/${this.statusClave}`).subscribe({
      next: (data) => { this.setResult(data); this.loading = false; },
      error: () => { this.message = 'Error al consultar estado'; this.messageType = 'error'; this.loading = false; }
    });
  }

  private setResult(data: any) {
    this.result = data;
    this.resultEntries = Object.entries(data).map(([k, v]) => ({ key: k, value: String(v) }));
  }
}
