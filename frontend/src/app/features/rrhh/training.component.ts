import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './training.component.html',
  styleUrl: './training.component.css',
    selector: 'app-training',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TrainingComponent implements OnInit {
  tab = 'courses';
  courses: any[] = [];
  editId: number | null = null;
  f: any = { courseType: 'INTERNO', status: 'PLANIFICADO' };
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.loadCourses(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  loadCourses() { this.http.get<any[]>(`${API_URL}/hr/training/courses/institution/${this.instId}`).subscribe({ next: d => this.courses = d }); }

  save() {
    const body = { ...this.f, institutionId: this.instId };
    const obs = this.editId ? this.http.put(`${API_URL}/hr/training/courses/${this.editId}`, body) : this.http.post(`${API_URL}/hr/training/courses`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.tab = 'courses'; this.loadCourses(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(c: any) { this.editId = c.id; this.f = { ...c }; this.tab = 'new'; }
  deleteCourse(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/hr/training/courses/${id}`).subscribe({ next: () => { this.loadCourses(); } }); }
  resetForm() { this.editId = null; this.f = { courseType: 'INTERNO', status: 'PLANIFICADO' }; }
}
