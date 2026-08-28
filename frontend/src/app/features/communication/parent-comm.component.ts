import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './parent-comm.component.html',
  styleUrl: './parent-comm.component.css',
    selector: 'app-parent-comm',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ParentCommComponent implements OnInit {
  communications: any[] = [];
  total = 0;
  pending = 0;
  responded = 0;
  read = 0;
  showCreateModal = false;
  showRespondModal = false;
  newComm: any = { studentId: null, representativeId: null, communicationType: 'ACADEMICO', subject: '', message: '', channel: 'IN_APP' };
  selectedComm: any = null;
  responseText = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/communication/parent-comm/student/${this.auth.userId() || 1}`).subscribe({
      next: r => {
        this.communications = r;
        this.total = r.length;
        this.pending = r.filter(c => c.status === 'ENVIADO').length;
        this.responded = r.filter(c => c.status === 'RESPONDIDO').length;
        this.read = r.filter(c => c.status === 'LEIDO').length;
      },
      error: () => {}
    });
  }

  createComm() {
    this.http.post<any>(`${API_URL}/communication/parent-comm`, { ...this.newComm, institutionId: this.auth.institutionId() || 1 }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  openRespondModal(c: any) { this.selectedComm = c; this.responseText = ''; this.showRespondModal = true; }

  respond() {
    this.http.post<any>(`${API_URL}/communication/parent-comm/${this.selectedComm.id}/respond`, { response: this.responseText }).subscribe({
      next: () => { this.showRespondModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
