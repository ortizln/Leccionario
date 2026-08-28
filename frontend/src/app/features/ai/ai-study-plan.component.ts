import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './ai-study-plan.component.html',
  styleUrl: './ai-study-plan.component.css',
    selector: 'app-ai-study-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AiStudyPlanComponent implements OnInit {
  plans: any[] = [];
  studentId = 0;
  showForm = false;
  form: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {}
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadPlans() {
    if (!this.studentId) return;
    this.http.get<any[]>(`${API_URL}/ai/study-plans/student/${this.studentId}?institutionId=${this.instId}`).subscribe(r => this.plans = r);
  }
  openForm() { this.form = {status:'DRAFT', progressPercent:0}; this.showForm = true; }
  save() {
    this.http.post(`${API_URL}/ai/study-plans`, {...this.form, institutionId: this.instId}).subscribe(() => {
      this.showForm = false; this.loadPlans();
    });
  }
  remove(id: number) {
    if (confirm('Eliminar plan?')) this.http.delete(`${API_URL}/ai/study-plans/${id}`).subscribe(() => this.loadPlans());
  }
}
