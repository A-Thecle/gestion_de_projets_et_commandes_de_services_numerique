import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandesComponent } from '../commande/commande.component';
import { CommandesService } from '../commande/commande.service';
import { ProjetsService } from '../projet/projet.service';
import { Commande } from '../commande/commande.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, CommandesComponent, RouterLink],
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.css'],
})
export class HomeAdminComponent implements OnInit {
  commandes: Commande[] = [];
  loading = true;

  // Compteurs
  commandesEnAttente = 0;
  projetsEnCours = 0;
  projetsTermines = 0;

  // Propriétés pour le modal de confirmation
  showConfirmModal: boolean = false;
  currentAction: 'valider' | 'refuser' | null = null;
  selectedCommandeId: string | null = null;
  showSuccessModal: boolean = false;
  successMessage: string = '';

  constructor(
    private commandeService: CommandesService,
    private projetService: ProjetsService
  ) {}

  ngOnInit(): void {
    this.loadTwoCommandes();
    this.loadCounters();
  }

  loadTwoCommandes(): void {
    this.commandeService.getAllCommandes().subscribe({
      next: (data) => {
        this.commandes = data.sort(
          (a, b) =>
            new Date(b.date_commande).getTime() - new Date(a.date_commande).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commandes', err);
        this.loading = false;
      }
    });
  }

  confirmAction(commande_id: string, action: 'valider' | 'refuser'): void {
    this.selectedCommandeId = commande_id;
    this.currentAction = action;
    this.showConfirmModal = true;
  }

  executeAction(): void {
    if (!this.selectedCommandeId || !this.currentAction) return;

    const actionObservable =
      this.currentAction === 'valider'
        ? this.commandeService.validerCommande(this.selectedCommandeId)
        : this.commandeService.refuserCommande(this.selectedCommandeId);

    actionObservable.subscribe({
      next: () => {
        this.loadTwoCommandes();
        this.loadCounters();
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

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  // Charger les compteurs dynamiques
  loadCounters(): void {
    // Commandes en attente
    this.commandeService.countCommandesEnAttente().subscribe({
      next: (count) => (this.commandesEnAttente = count),
      error: (err) => console.error('Erreur compteur commandes en attente', err)
    });

    // Projets en cours
    this.projetService.countProjetsEnCours().subscribe({
      next: (count) => (this.projetsEnCours = count),
      error: (err) => console.error('Erreur compteur projets en cours', err)
    });

    // Projets terminés
    this.projetService.countProjetsTermines().subscribe({
      next: (count) => (this.projetsTermines = count),
      error: (err) => console.error('Erreur compteur projets terminés', err)
    });
  }
}