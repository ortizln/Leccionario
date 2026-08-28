import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './curricular-adaptations.component.html',
  styleUrl: './curricular-adaptations.component.css',
    selector: 'app-curricular-adaptations',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CurricularAdaptationsComponent implements OnInit {
  adaptations: any[] = [];
  showForm = false;
  editItem: any = null;
  form: any = { studentId: null, specialNeedsId: null, adaptationType: 'MODIFICACION', subjectId: null, description: '', strategies: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/adaptations`).subscribe({
      next: d => this.adaptations = d,
      error: () => this.adaptations = []
    });
  }

  resetForm() { this.form = { studentId: null, specialNeedsId: null, adaptationType: 'MODIFICACION', subjectId: null, description: '', strategies: '' }; }

  save() {
    const payload = { ...this.form, institutionId: this.auth.institutionId() || 1 };
    const req = this.editItem
      ? this.http.put(`${API_URL}/adaptations/${this.editItem.id}`, payload)
      : this.http.post(`${API_URL}/adaptations`, payload);
    req.subscribe(() => { this.showForm = false; this.load(); });
  }

  edit(a: any) { this.editItem = a; this.form = { ...a }; this.showForm = true; }

  deleteItem(id: number) {
    if (confirm('Eliminar adaptacion?')) this.http.delete(`${API_URL}/adaptations/${id}`).subscribe(() => this.load());
  }
}
