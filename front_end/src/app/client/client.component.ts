import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientService } from './client.service';
import { Client } from './client.model';
import { CommonModule } from '@angular/common';
import { ClientModalComponent } from '../client-modal/client-modal.component';
import { ClientEditDialogComponent } from '../client-edit-dialog/client-edit-dialog.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SearchService } from '../search-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
})
export class ClientComponent implements OnInit, OnDestroy {
  clients: Client[] = []; // Toujours initialisé
  loading = true;
  currentPage: number = 1;
  itemsPerPage: number = 4;
  private sub!: Subscription;
  searchTerm: string = '';

  showSuccessModal = false;
  successMessage = '';

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getAllClient();

    // Écoute la recherche
    this.sub = this.searchService.searchTerm$.subscribe((term) => {
      this.searchTerm = term || '';
      this.currentPage = 1; // Reset pagination
      this.searchClients();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /** Récupérer tous les clients */
  getAllClient(): void {
    this.loading = true;
    this.clientService.getAllClient().subscribe({
      next: (data) => {
        this.clients = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des clients', err);
        this.clients = [];
        this.loading = false;
      },
    });
  }

  /** Recherche client côté front + back */
  searchClients(): void {
    this.loading = true;

    if (!this.searchTerm.trim()) {
      this.getAllClient();
      return;
    }

    this.clientService.searchClient(this.searchTerm).subscribe({
      next: (data) => {
        this.clients = data || []; // Toujours tableau
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur recherche client', err);
        this.clients = [];
        this.loading = false;
      },
    });
  }

  /** Pagination */
  get paginatedClients(): Client[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.clients ? this.clients.slice(start, start + this.itemsPerPage) : [];
  }

  get totalPages(): number {
    return this.clients ? Math.ceil(this.clients.length / this.itemsPerPage) : 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  /** Modals */
  openFicheClient(client: Client): void {
    this.dialog.open(ClientModalComponent, {
      width: '900px',
      data: { code_utilisateur: client.code_utilisateur },
    });
  }

  openEditDialog(client: Client): void {
    const dialogRef = this.dialog.open(ClientEditDialogComponent, {
      width: '500px',
      data: { client },
    });

    dialogRef.afterClosed().subscribe((result: Partial<Client> | undefined) => {
      if (result) {
        this.clientService.updateClient(client.id, result).subscribe({
          next: (updatedClient) => {
            const index = this.clients.findIndex((c) => c.id === client.id);
            if (index !== -1) this.clients[index] = updatedClient;

            this.successMessage = 'Données client modifiées avec succès !';
            this.showSuccessModal = true;

            setTimeout(() => (this.showSuccessModal = false), 3000);
          },
          error: (err) => console.error('Erreur lors de la mise à jour', err),
        });
      }
    });
  }

  deleteClient(client: Client): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '380px',
      data: {
        title: 'Confirmer la suppression',
        data: { titre: `${client.nom} ${client.prenom} (${client.code_utilisateur})` },
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.clientService.deleteClient(client.id).subscribe({
          next: () => {
            this.clients = this.clients.filter((c) => c.id !== client.id);
          },
          error: (err) => console.error('Erreur suppression :', err),
        });
      }
    });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }
}
