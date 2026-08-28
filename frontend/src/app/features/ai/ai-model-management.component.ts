import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './ai-model-management.component.html',
  styleUrl: './ai-model-management.component.css',
    selector: 'app-ai-model-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AiModelManagementComponent implements OnInit {
  models: any[] = [];
  showFormModal = false;
  form: any = {};

  activeModelsCount() { return this.models.filter(m => m.status === 'ACTIVO').length; }
  get avgAccuracy() {
    const withAcc = this.models.filter(m => m.accuracy != null);
    return withAcc.length ? withAcc.reduce((s, m) => s + m.accuracy, 0) / withAcc.length * 100 : 0;
  }
  get modelTypes() { return new Set(this.models.map(m => m.modelType)).size; }

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/ai/models?institutionId=${this.instId}`).subscribe({ next: r => this.models = r, error: () => {} });
  }

  resetForm() { this.form = { name: '', modelType: 'CLASIFICACION', version: '1.0.0', accuracy: 0, status: 'ACTIVO', description: '' }; }

  save() {
    this.http.post<any>(`${API_URL}/ai/models`, { ...this.form, institutionId: this.instId }).subscribe({
      next: () => { this.showFormModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  deleteModel(id: number) {
    if (!confirm('Eliminar modelo?')) return;
    this.http.delete(`${API_URL}/ai/models/${id}`).subscribe({ next: () => this.load() });
  }
}
