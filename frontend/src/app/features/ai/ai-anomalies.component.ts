import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './ai-anomalies.component.html',
  styleUrl: './ai-anomalies.component.css',
    selector: 'app-ai-anomalies',
  standalone: true,
  imports: [CommonModule],
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
