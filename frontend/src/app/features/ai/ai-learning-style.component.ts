import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './ai-learning-style.component.html',
  styleUrl: './ai-learning-style.component.css',
    selector: 'app-ai-learning-style',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AiLearningStyleComponent implements OnInit {
  style: any = null;
  studentId = 0;
  showForm = false;
  form: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {}
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadStyle() {
    if (!this.studentId) return;
    this.http.get<any>(`${API_URL}/ai/learning-styles/student/${this.studentId}?institutionId=${this.instId}`).subscribe({
      next: r => this.style = r,
      error: () => this.style = null
    });
  }
  save() {
    this.http.post(`${API_URL}/ai/learning-styles`, {...this.form, institutionId: this.instId}).subscribe(() => {
      this.showForm = false; this.loadStyle();
    });
  }
}
