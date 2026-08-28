import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './employee-benefits.component.html',
  styleUrl: './employee-benefits.component.css',
    selector: 'app-employee-benefits',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EmployeeBenefitsComponent implements OnInit {
  benefits: any[] = [];
  showForm = false;
  form: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/benefits?institutionId=${this.instId}`).subscribe(r => this.benefits = r);
  }
  openForm() { this.form = {benefitType:'BONO', frequency:'MONTHLY'}; this.showForm = true; }
  save() {
    this.http.post(`${API_URL}/hr/benefits`, {...this.form, institutionId: this.instId}).subscribe(() => { this.showForm = false; this.load(); });
  }
  remove(id: number) {
    if (confirm('Eliminar beneficio?')) this.http.delete(`${API_URL}/hr/benefits/${id}`).subscribe(() => this.load());
  }
}
