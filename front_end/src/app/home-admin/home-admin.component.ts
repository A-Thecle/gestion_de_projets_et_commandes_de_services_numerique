// home-admin.component.ts
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

  // compteurs
  commandesEnAttente = 0;
  projetsEnCours = 0;
  projetsTermines = 0;

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

  validerCommande(id: string): void {
    this.commandeService.validerCommande(id).subscribe({
      next: () => {
        console.log(`Commande ${id} validée`);
        this.loadTwoCommandes(); // recharger après validation
        this.loadCounters();     // mettre à jour les compteurs
      },
      error: (err) => console.error('Erreur validation commande', err)
    });
  }

  // 🔹 Charger les compteurs dynamiques
  loadCounters(): void {
    // Commandes en attente
    this.commandeService.countCommandesEnAttente().subscribe({
      next: (count) => this.commandesEnAttente = count,
      error: (err) => console.error('Erreur compteur commandes en attente', err)
    });

    // Projets en cours
    this.projetService.countProjetsEnCours().subscribe({
      next: (count) => this.projetsEnCours = count,
      error: (err) => console.error('Erreur compteur projets en cours', err)
    });

    // Projets terminés
    this.projetService.countProjetsTermines().subscribe({
      next: (count) => this.projetsTermines = count,
      error: (err) => console.error('Erreur compteur projets terminés', err)
    });
  }
}
