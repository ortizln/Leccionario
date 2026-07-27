import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-ai-anomalies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-exclamation-diamond me-2"></i>Anomalias Detectadas</h5>
      <span class="badge bg-danger">{{ anomalies.length }} activas</span>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Tipo</th><th>Entidad</th><th>Descripcion</th><th>Severidad</th><th>Valor</th><th>Esperado</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let a of anomalies">
                <td><span class="badge bg-info">{{ a.anomalyType }}</span></td>
                <td>{{ a.entityType }} #{{ a.entityId }}</td>
                <td>{{ a.description | slice:0:80 }}</td>
                <td><span class="badge" [ngClass]="{'bg-danger': a.severity==='CRITICA'||a.severity==='ALTA','bg-warning text-dark': a.severity==='MEDIA','bg-secondary': a.severity==='BAJA'}">{{ a.severity }}</span></td>
                <td>{{ a.detectedValue }}</td>
                <td>{{ a.expectedRange }}</td>
                <td><span class="badge" [ngClass]="{'bg-danger': a.status==='DETECTADA','bg-success': a.status==='RESUELTA'}">{{ a.status }}</span></td>
                <td><button *ngIf="a.status==='DETECTADA'" class="btn btn-outline-success btn-sm" (click)="resolve(a.id!)"><i class="bi bi-check-circle"></i></button></td>
              </tr>
              <tr *ngIf="!anomalies.length"><td colspan="8" class="text-center text-muted">Sin anomalias detectadas</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AiAnomaliesComponent implements OnInit {
  anomalies: any[] = [];
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/ai/anomalies?institutionId=${this.instId}`).subscribe(r => this.anomalies = r);
  }
  resolve(id: number) {
    const notes = prompt('Notas de resolucion:');
    if (notes !== null) {
      this.http.post(`${API_URL}/ai/anomalies/${id}/resolve`, { notes }).subscribe(() => this.load());
    }
  }
}
