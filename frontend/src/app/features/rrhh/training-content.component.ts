import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './training-content.component.html',
  styleUrl: './training-content.component.css',
    selector: 'app-training-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TrainingContentComponent implements OnInit {
  courses: any[] = [];
  contents: any[] = [];
  selectedCourseId: number | null = null;
  showForm = false;
  form: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {
    this.http.get<any[]>(`${API_URL}/hr/training/courses?institutionId=${this.instId}`).subscribe(r => this.courses = r);
  }
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadContents() {
    if (!this.selectedCourseId) { this.contents = []; return; }
    this.http.get<any[]>(`${API_URL}/hr/training-content/course/${this.selectedCourseId}`).subscribe(r => this.contents = r);
  }
  openForm(c?: any) {
    this.form = c ? {...c} : {contentType:'LESSON', sortOrder:0};
    this.showForm = true;
  }
  save() {
    const req = this.form.id
      ? this.http.put(`${API_URL}/hr/training-content/${this.form.id}`, {...this.form, institutionId: this.instId})
      : this.http.post(`${API_URL}/hr/training-content`, {...this.form, institutionId: this.instId});
    req.subscribe(() => { this.showForm = false; this.loadContents(); });
  }
  remove(id: number) {
    if (confirm('Eliminar contenido?')) this.http.delete(`${API_URL}/hr/training-content/${id}`).subscribe(() => this.loadContents());
  }
}
