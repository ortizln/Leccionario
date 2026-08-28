import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './ai-recommendations.component.html',
  styleUrl: './ai-recommendations.component.css',
    selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule],
})
export class AiRecommendationsComponent implements OnInit {
  recommendations: any[] = [];
  stats: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/ai/recommendations?institutionId=${this.instId}`).subscribe(r => this.recommendations = r);
    this.http.get<any>(`${API_URL}/ai/recommendations/stats?institutionId=${this.instId}`).subscribe(r => this.stats = r);
  }
  apply(id: number) {
    this.http.post(`${API_URL}/ai/recommendations/${id}/apply`, {}).subscribe(() => this.load());
  }
  dismiss(id: number) {
    this.http.post(`${API_URL}/ai/recommendations/${id}/dismiss`, {}).subscribe(() => this.load());
  }
}
