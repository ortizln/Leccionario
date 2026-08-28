import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './tuition.component.html',
  styleUrl: './tuition.component.css',
    selector: 'app-tuition',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TuitionComponent implements OnInit {
  tab = 'plans';
  plans: any[] = [];
  studentTuitions: any[] = [];
  showPlanModal = false;
  showPayModal = false;
  newPlan: any = { name: '', description: '', amount: 0, ivaIncluded: true, category: 'PENSION' };
  selectedTuition: any = null;
  payAmount = 0;
  payMethod = 'EFECTIVO';
  selectedPeriodId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.loadPlans(); this.loadStudentTuitions(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadPlans() {
    this.http.get<any[]>(`${API_URL}/finance/tuitions/plans?institutionId=${this.instId}`).subscribe({ next: r => this.plans = r, error: () => {} });
  }

  loadStudentTuitions() {
    this.http.get<any[]>(`${API_URL}/finance/tuitions/period/${this.selectedPeriodId}`).subscribe({ next: r => this.studentTuitions = r, error: () => {} });
  }

  createPlan() {
    this.http.post<any>(`${API_URL}/finance/tuitions/plans`, { ...this.newPlan, institutionId: this.instId }).subscribe({
      next: () => { this.showPlanModal = false; this.loadPlans(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  deletePlan(id: number) {
    if (!confirm('Eliminar plan?')) return;
    this.http.delete(`${API_URL}/finance/tuitions/plans/${id}`).subscribe({ next: () => this.loadPlans() });
  }

  openPayModal(st: any) {
    this.selectedTuition = st;
    this.payAmount = st.totalAmount - st.paidAmount;
    this.showPayModal = true;
  }

  confirmPay() {
    this.http.post<any>(`${API_URL}/finance/tuitions/${this.selectedTuition.id}/payments`, { amount: this.payAmount, paymentMethod: this.payMethod }).subscribe({
      next: () => { this.showPayModal = false; this.loadStudentTuitions(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
