import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ServiceService } from '../services/service.service';
import { ServicesEntity } from '../services/services.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-espace-service-client',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './espace-service-client.component.html',
  styleUrls: ['./espace-service-client.component.css']
})
export class EspaceServiceClientComponent implements OnInit {
  services: ServicesEntity[] = [];
  selectedService: ServicesEntity | null = null;
  loading = true;
  currentPage: number = 1;
  itemsPerPage: number = 4;

  constructor(private serviceService: ServiceService) {}

  ngOnInit(): void {
    this.getAllServices();
  }

  getAllServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
        this.loading = false; // Arrêter le chargement une fois les données reçues
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des services', error);
        this.loading = false; // Arrêter le chargement même en cas d'erreur
      }
    });
  }

  getFirstSentence(text: string): string {
    if (!text) return '';
    return text.split('. ')[0];
  }

  openDetails(event: Event, service: ServicesEntity): void {
    event.preventDefault(); // Empêche le rechargement de la page
    this.selectedService = service;
  }

  closeDetails(): void {
    this.selectedService = null;
  }

  get paginatedProjet(): ServicesEntity[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.services.slice(start, start + this.itemsPerPage);
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