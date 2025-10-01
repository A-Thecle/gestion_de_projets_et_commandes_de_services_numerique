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

@Component({
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  selector: 'app-admin-services',
  templateUrl: './service-admin.component.html',
  styleUrls: ['./service-admin.component.css']
})
export class ServiceAdminComponent implements OnInit {
  services: ServicesEntity[] = [];
  loading: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 4;
  private sub!: Subscription;
  
  showSuccessModal: boolean = false;
  successMessage: string = '';


  constructor(private serviceService: ServiceService, 
    private dialog: MatDialog,
    private searchService : SearchService
  ) {}

  ngOnInit(): void {
    this.getAllServices();

    // 🔎 écoute la recherche
    this.sub = this.searchService.searchTerm$.subscribe((term) => {
      if (term && term.trim() !== '') {
        this.loading = true;
        this.serviceService.searchService(term).subscribe({
          next: (data) => {
            console.log('Résultats recherche projets :', data);
            this.services = data;
            this.loading = false;
            this.currentPage = 1; // Réinitialise à la page 1 après recherche
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
        this.currentPage = 1; // Réinitialise à la page 1 après chargement
      },
      error: (error) => {
        console.error('Erreur lors du chargement des services', error);
        this.loading = false;
      }
    });
  }

  // Nouveau getter pour les services paginés
  get pagedServices(): ServicesEntity[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.services.slice(startIndex, startIndex + this.itemsPerPage);
  }

  openAddServiceModal(): void {
    const dialogRef = this.dialog.open(AddServiceModalComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.services.push(result); // Ajoute le nouveau service à la liste
        // Optionnel : Si on ajoute sur une page non visible, on peut ajuster currentPage
        if (this.services.length > this.itemsPerPage * this.currentPage) {
          this.currentPage = Math.ceil(this.services.length / this.itemsPerPage);
        }
           
    this.successMessage = 'Service ajouté avec succès !';
    this.showSuccessModal = true;
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
        // Met à jour le service dans la liste
        const index = this.services.findIndex(s => s.service_id === result.service_id);
        if (index !== - 1) {
          this.services[index] = result;
               // Affiche la modal de succès
      this.successMessage = 'Service modifié avec succès !';
      this.showSuccessModal = true;
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
            // Optionnel : Ajuste la page si on supprime le dernier élément d'une page
            if (this.services.length === 0) {
              this.currentPage = 1;
            } else if (this.currentPage > this.totalPages) {
              this.currentPage = this.totalPages;
            }
             // Affiche la modal de succès
            this.successMessage = 'Service supprimé avec succès !';
            this.showSuccessModal = true;
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du service', error);
          }
        });
      }
    });
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