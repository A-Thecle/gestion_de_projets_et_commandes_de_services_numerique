import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink , RouterLinkActive} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css'],
  imports: [CommonModule, RouterOutlet, RouterLink, MatIconModule, RouterLinkActive]
})
export class PublicLayoutComponent {}
