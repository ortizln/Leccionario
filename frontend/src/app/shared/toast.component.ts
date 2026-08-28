import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../core/toast.service';

@Component({
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
    selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
