import { Component, OnInit } from '@angular/core';
import { Commande } from './commande.model';
import { CommandesService } from './commande.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { SearchService } from '../search-service.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-commandes-list',
  imports: [CommonModule],
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.css']
})
export class CommandesComponent implements OnInit {
  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  loading = true;
  currentPage: number = 1;
  itemsPerPage: number = 4;
  private search!: Subscription;
  private sub!: Subscription;
  showConfirmModal: boolean = false;
  currentAction: 'valider' | 'refuser' | null = null;
  selectedCommandeId: string | null = null;
  showSuccessModal: boolean = false;
  successMessage: string = '';
  showDescriptionModal: boolean = false; // Nouvelle propriété pour le modal de description
  selectedDescription: string = ''; // Pour stocker la description sélectionnée

  constructor(
    private commandesService: CommandesService,
    private adminLayout: AdminLayoutComponent,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getAllCommandes();

    this.sub = this.searchService.searchTerm$.subscribe(term => {
      if (term) {
        this.commandesService.searchCommandes(term).subscribe(data => {
          this.commandes = data;
          this.filteredCommandes = [...this.commandes].sort((a, b) =>
            new Date(b.date_commande).getTime() - new Date(a.date_commande).getTime()
          );
        });
      } else {
        this.getAllCommandes();
      }
    });
  }

  getAllCommandes(): void {
    this.commandesService.getAllCommandes().subscribe({
      next: (data) => {
        this.commandes = data;
        this.filteredCommandes = [...this.commandes].sort((a, b) => 
          new Date(b.date_commande).getTime() - new Date(a.date_commande).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des commandes', err);
        this.loading = false;
      }
    });
  }

  validerCommande(commande_id: string): void {
    this.commandesService.validerCommande(commande_id).subscribe({
      next: () => this.getAllCommandes(),
      error: (err) => console.error('Erreur lors de la validation', err)
    });
  }

  refuserCommande(commande_id: string): void {
    this.commandesService.refuserCommande(commande_id).subscribe({
      next: () => this.getAllCommandes(),
      error: (err) => console.error('Erreur lors du refus', err)
    });
  }

  encodeFileUrl(filename: string): string {
    return `http://localhost:3000/uploads/${encodeURIComponent(filename)}`;
  }

  isPdf(fileName: string): boolean {
    return fileName?.toLowerCase().endsWith('.pdf');
  }

  confirmAction(commande_id: string, action: 'valider' | 'refuser') {
    this.selectedCommandeId = commande_id;
    this.currentAction = action;
    this.showConfirmModal = true;
  }

  executeAction() {
    if (!this.selectedCommandeId || !this.currentAction) return;

    const actionObservable =
      this.currentAction === 'valider'
        ? this.commandesService.validerCommande(this.selectedCommandeId)
        : this.commandesService.refuserCommande(this.selectedCommandeId);

    actionObservable.subscribe({
      next: () => {
        this.getAllCommandes();
        this.showConfirmModal = false;
        this.successMessage =
          this.currentAction === 'valider'
            ? 'Commande validée avec succès !'
            : 'Commande refusée avec succès !';
        this.showSuccessModal = true;
        setTimeout(() => {
          this.showSuccessModal = false;
        }, 3000);

        this.selectedCommandeId = null;
        this.currentAction = null;
      },
      error: (err) => {
        console.error('Erreur lors de l\'action', err);
        this.showConfirmModal = false;
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  // Nouvelle méthode pour ouvrir le modal de description
  openDescriptionModal(description: string): void {
    this.selectedDescription = description;
    this.showDescriptionModal = true;
  }

  // Nouvelle méthode pour fermer le modal de description
  closeDescriptionModal(): void {
    this.showDescriptionModal = false;
    this.selectedDescription = '';
  }

  get paginatedCommandes(): Commande[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCommandes.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCommandes.length / this.itemsPerPage);
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