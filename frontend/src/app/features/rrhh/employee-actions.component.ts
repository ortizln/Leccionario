import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './employee-actions.component.html',
  styleUrl: './employee-actions.component.css',
    selector: 'app-employee-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EmployeeActionsComponent implements OnInit {
  actions: any[] = [];
  showForm = false;
  form: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/actions?institutionId=${this.instId}`).subscribe(r => this.actions = r);
  }
  openForm() { this.form = {actionType:'AMONESTACION', severity:'LEVE'}; this.showForm = true; }
  save() {
    this.http.post(`${API_URL}/hr/actions`, {...this.form, institutionId: this.instId}).subscribe(() => { this.showForm = false; this.load(); });
  }
  remove(id: number) {
    if (confirm('Eliminar accion?')) this.http.delete(`${API_URL}/hr/actions/${id}`).subscribe(() => this.load());
  }
}
