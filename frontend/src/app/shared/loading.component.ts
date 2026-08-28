import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../core/loading.service';

@Component({
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
    selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {}
}
