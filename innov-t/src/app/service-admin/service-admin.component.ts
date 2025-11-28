import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ServiceService } from '../services/service.service';
import { ServicesEntity } from '../services/services.model';
import { CommonModule } from '@angular/common';
import { AddServiceModalComponent } from '../add-service-modal/add-service-modal.component';
import { EditServiceModalComponent } from '../edit-service-modal/edit-service-modal.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { Subscription } from 'rxjs';
import { SearchService } from '../search-service.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  standalone: true,
  imports: [CommonModule, MatDialogModule, NgxPaginationModule],
  selector: 'app-admin-services',
  templateUrl: './service-admin.component.html',
  styleUrls: ['./service-admin.component.css']
})
export class ServiceAdminComponent implements OnInit {
  services: ServicesEntity[] = [];
  loading = true;
  currentPage = 1;
  itemsPerPage = 6;
  private sub!: Subscription;
  showSuccessModal = false;
  successMessage = '';

  constructor(
    private serviceService: ServiceService,
    private dialog: MatDialog,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getAllServices();

    this.sub = this.searchService.searchTerm$.subscribe((term) => {
      if (term && term.trim() !== '') {
        this.loading = true;
        this.serviceService.searchService(term).subscribe({
          next: (data) => {
            this.services = data;
            this.loading = false;
            this.currentPage = 1;
          },
          error: (err) => {
            console.error('Erreur recherche projets', err);
            this.loading = false;
          },
        });
      } else {
        this.getAllServices();
      }
    });
  }

  getAllServices(): void {
    this.loading = true;
    this.serviceService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
        this.currentPage = 1;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des services', error);
        this.loading = false;
      }
    });
  }

  openAddServiceModal(): void {
    const dialogRef = this.dialog.open(AddServiceModalComponent, { width: '500px' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.services.push(result);
        this.successMessage = 'Service ajouté avec succès !';
        this.showSuccessModal = true;
        setTimeout(() => (this.showSuccessModal = false), 2500);

      }
    });
  }

  openEditDialog(service: ServicesEntity): void {
    const dialogRef = this.dialog.open(EditServiceModalComponent, {
      width: '500px',
      data: service
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.services.findIndex(s => s.service_id === result.service_id);
        if (index !== -1) {
          this.services[index] = result;
          this.successMessage = 'Service modifié avec succès !';
          this.showSuccessModal = true;
            setTimeout(() => {
          this.showSuccessModal = false;
        }, 2000);
        }
      }
    });
  }

  deleteService(service: ServicesEntity): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { titre: service.nom_service }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.serviceService.deleteService(service.service_id).subscribe({
          next: () => {
            this.services = this.services.filter(s => s.service_id !== service.service_id);
            this.successMessage = 'Service supprimé avec succès !';
            this.showSuccessModal = true;
             setTimeout(() => (this.showSuccessModal = false), 2500);
          },
          error: (error) => console.error('Erreur lors de la suppression', error)
        });
      }
    });
  }
}
