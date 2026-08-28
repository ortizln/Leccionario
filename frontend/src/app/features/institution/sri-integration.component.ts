import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  templateUrl: './sri-integration.component.html',
  styleUrl: './sri-integration.component.css',
    selector: 'app-sri-integration',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
