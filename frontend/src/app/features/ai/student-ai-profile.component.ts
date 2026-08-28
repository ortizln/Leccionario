import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './student-ai-profile.component.html',
  styleUrl: './student-ai-profile.component.css',
    selector: 'app-student-ai-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class StudentAiProfileComponent implements OnInit {
  studentId: number | null = null;
  profile: any = null;
  searched = false;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {}

  private get instId(): number { return this.auth.institutionId() || 1; }

  loadProfile() {
    if (!this.studentId) return;
    this.http.get<any>(`${API_URL}/ai/profiles/${this.studentId}?institutionId=${this.instId}`).subscribe({
      next: r => { this.profile = r; this.searched = true; },
      error: () => { this.profile = null; this.searched = true; }
    });
  }

  analyze() {
    if (!this.studentId) return;
    this.http.post<any>(`${API_URL}/ai/analyze/${this.studentId}?institutionId=${this.instId}`, {}).subscribe({
      next: r => { this.profile = r; this.searched = true; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
