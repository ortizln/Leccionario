import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  templateUrl: './student-health.component.html',
  styleUrl: './student-health.component.css',
    selector: 'app-student-health',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class StudentHealthComponent implements OnInit {
  tab = 'record';
  studentId: number | null = null;
  hr: any = {};
  vaccines: any[] = [];
  vf: any = {};
  message = ''; isError = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  onStudentChange() { this.loadRecord(); this.loadVaccines(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  loadSummary() { this.loadRecord(); this.loadVaccines(); }

  loadRecord() {
    if (!this.studentId) return;
    this.http.get<any>(`${API_URL}/student-health/records/student/${this.studentId}`).subscribe({ next: d => { if (d) this.hr = d; } });
  }

  saveRecord() {
    if (!this.studentId) return;
    this.http.post(`${API_URL}/student-health/records`, { ...this.hr, studentId: this.studentId }).subscribe({
      next: () => this.showMsg('Guardado'), error: () => this.showMsg('Error', true)
    });
  }

  loadVaccines() {
    if (!this.studentId) return;
    this.http.get<any[]>(`${API_URL}/student-health/vaccinations/student/${this.studentId}`).subscribe({ next: d => this.vaccines = d });
  }

  addVaccine() {
    if (!this.studentId) return;
    this.http.post(`${API_URL}/student-health/vaccinations`, { ...this.vf, studentId: this.studentId }).subscribe({
      next: () => { this.showMsg('Vacuna agregada'); this.loadVaccines(); this.resetVaccForm(); }, error: () => this.showMsg('Error', true)
    });
  }

  deleteVacc(id: number) {
    this.http.delete(`${API_URL}/student-health/vaccinations/${id}`).subscribe({ next: () => this.loadVaccines() });
  }

  resetVaccForm() { this.vf = {}; }
}
