import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Commande } from './commande.model';
import { CommandesService } from './commande.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { SearchService } from '../search-service.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-commandes-list',
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.css'],

})
export class CommandesComponent implements OnInit {
  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  loading = true;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  private search!: Subscription;
  private sub!: Subscription;
  showConfirmModal: boolean = false;
  currentAction: 'valider' | 'refuser' | null = null;
  selectedCommandeId: string | null = null;
  showSuccessModal: boolean = false;
  successMessage: string = '';
  showDescriptionModal: boolean = false;
  selectedDescription: string = '';

  constructor(
    private commandesService: CommandesService,
    private adminLayout: AdminLayoutComponent,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getAllCommandes();

    // Gestion recherche
    this.sub = this.searchService.searchTerm$.subscribe(term => {
      if (term) {
        this.commandesService.searchCommandes(term).subscribe(data => {
          this.commandes = this.normalizeStatuts(data);
          this.filteredCommandes = [...this.commandes].sort((a, b) =>
            new Date(b.date_commande).getTime() - new Date(a.date_commande).getTime()
          );
        });
      } else {
        this.getAllCommandes();
      }
    });
  }

  /** ✅ Normalise les statuts pour éviter les incohérences */
  private normalizeStatuts(data: Commande[]): Commande[] {
    return data.map(cmd => ({
      ...cmd,
      statut_commande: cmd.statut_commande
        ? cmd.statut_commande.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        : ''
    }));
  }

  getAllCommandes(): void {
    this.commandesService.getAllCommandes().subscribe({
      next: (data) => {
        this.commandes = this.normalizeStatuts(data);
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

  /** ✅ Exécution instantanée : statut + désactivation directe */
  executeAction() {
    if (!this.selectedCommandeId || !this.currentAction) return;

    const index = this.commandes.findIndex(c => c.commandes_id === this.selectedCommandeId);
    if (index === -1) return;

    // 🔹 On change instantanément le statut côté front
    const newStatus = this.currentAction === 'valider' ? 'acceptee' : 'refusee';
    this.commandes[index].statut_commande = newStatus;
    this.filteredCommandes[index].statut_commande = newStatus;

    // 🔹 Ferme la modale et affiche le message tout de suite
    this.showConfirmModal = false;
    this.successMessage =
      this.currentAction === 'valider'
        ? 'Commande validée avec succès !'
        : 'Commande refusée avec succès !';
    this.showSuccessModal = true;

    setTimeout(() => (this.showSuccessModal = false), 2500);

    // 🔹 Met à jour aussi côté backend
    const actionObservable =
      this.currentAction === 'valider'
        ? this.commandesService.validerCommande(this.selectedCommandeId)
        : this.commandesService.refuserCommande(this.selectedCommandeId);

    actionObservable.subscribe({
      next: () => {
        // Rien à faire ici, déjà mis à jour localement
      },
      error: (err) => {
        console.error("Erreur backend :", err);
      }
    });

    // Réinitialisation
    this.selectedCommandeId = null;
    this.currentAction = null;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  openDescriptionModal(description: string): void {
    this.selectedDescription = description;
    this.showDescriptionModal = true;
  }

  closeDescriptionModal(): void {
    this.showDescriptionModal = false;
    this.selectedDescription = '';
  }

  get paginatedCommandes(): Commande[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCommandes.slice(start, start + this.itemsPerPage);
  }


}
