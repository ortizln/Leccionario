import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './communication-portal.component.html',
  styleUrl: './communication-portal.component.css',
    selector: 'app-communication-portal',
  standalone: true,
  imports: [CommonModule],
})
export class CommunicationPortalComponent implements OnInit {
  portalData: any = {};

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/communication/portal?institutionId=${this.instId}`).subscribe({
      next: r => this.portalData = r,
      error: () => {}
    });
  }
}
