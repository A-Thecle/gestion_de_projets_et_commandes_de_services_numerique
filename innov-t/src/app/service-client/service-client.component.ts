import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ServiceService } from '../services/service.service';
import { ServicesEntity } from '../services/services.model';
import { RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

declare var bootstrap: any;
@Component({
  selector: 'app-service-client',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, NgxPaginationModule], // Ajout de CurrencyPipe
  templateUrl: './service-client.component.html',
  styleUrls: ['./service-client.component.css'] // Correction de styleUrl à styleUrls
})
export class ServiceClientComponent implements OnInit {
  services: ServicesEntity[] = [];
  selectedService: ServicesEntity | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 2;

  constructor(private serviceService: ServiceService) {}

  ngOnInit(): void {
    this.getAllServices();
  }

  getAllServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des services', error);
      }
    });
  }

 getFirstSentence(text: string): string {
  if (!text) return '';
  return text.length > 60 ? text.substring(0, 60) + '...' : text;
}

  openDetails(event: Event, service: ServicesEntity): void {
    event.preventDefault(); 
    this.selectedService = service;
  }

  closeDetails(): void {
    this.selectedService = null;
  }

  getIconClass(index: number): string {
    switch (index) {
      case 0: return 'icon-web';
      case 1: return 'icon-dev-web';
      case 2: return 'icon-web';
      default: return 'icon-dev-web';
    }
  }

    get totalPages(): number {
    return Math.ceil(this.services.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}