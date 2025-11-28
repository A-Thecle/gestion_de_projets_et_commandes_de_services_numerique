import { Component, OnInit } from '@angular/core';
import { ProjetsService } from '../projet/projet.service';
import { Projet } from '../projet/projet.model';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjetDetailsDialogComponent } from '../projet-detail-dialog/projet-detail-dialog.component';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-projet-by-client',
  standalone: true,
  imports: [CommonModule, MatDialogModule, NgxPaginationModule],
  templateUrl: './projet-by-client.component.html',
  styleUrls: ['./projet-by-client.component.css']
})
export class ProjetByClientComponent implements OnInit {
  projetsEnAttente: Projet[] = [];
  projetsEnCours: Projet[] = [];
  projetsEnRevision: Projet[] = [];
  projetsTermines: Projet[] = [];
  loading = true;
  selectedDescription: string | null = null;
  currentPageEnAttente: number = 1;
  currentPageEnCours: number = 1;
  currentPageEnRevision: number = 1;
  currentPageTermines: number = 1;

  constructor(
    private projetsService: ProjetsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProjets();
  }

  /** 🔹 Récupère et classe les projets du client par état */
  private loadProjets(): void {
    this.projetsService.getMyProjets().subscribe({
      next: (projets: Projet[]) => {
        console.log('Projets reçus:', projets);

        this.projetsEnAttente = projets.filter(p => p.etat === 'en_attente');
        this.projetsEnCours = projets.filter(p => p.etat === 'en_cours');
        this.projetsEnRevision = projets.filter(p => p.etat === 'en_revision');
        this.projetsTermines = projets.filter(p => p.etat === 'termine');

        // Réinitialiser la pagination
        this.currentPageEnAttente = 1;
        this.currentPageEnCours = 1;
        this.currentPageEnRevision = 1;
        this.currentPageTermines = 1;

        this.loading = false;

        if (projets.length === 0) {
          this.snackBar.open('Aucun projet trouvé pour votre compte.', 'OK', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des projets:', err);
        this.snackBar.open('Erreur lors du chargement des projets. Veuillez réessayer.', 'OK', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loading = false;
      }
    });
  }

  /** 🔹 Ouvre le modal avec les détails complets du projet */
  openDetails(projet: Projet): void {
    console.log('Ouverture du modal pour projet:', projet);
    this.dialog.open(ProjetDetailsDialogComponent, {
      width: '500px',
      data: projet
    });
  }

  /** 🔹 Ouvre le modal de description complète */
  openDescriptionModal(event: Event, projet: Projet): void {
    event.preventDefault();
    this.selectedDescription = projet.description_projet || 'Aucune description disponible.';
  }

  /** 🔹 Ferme le modal de description */
  closeDescriptionModal(): void {
    this.selectedDescription = null;
  }

  /** 
   * 🔹 Récupère uniquement les 20 premiers mots d'une description
   * pour ne pas surcharger la carte du projet
   */
/** Retourne les N premiers mots (par défaut 20) en retirant le HTML et les espaces superflus */
getFirstTwentyWords(description: string | undefined): string {
  const N = 20;
  if (!description) return 'Aucune description disponible.';

  // 1) Supprimer les balises HTML si présentes
  const withoutHtml = description.replace(/<[^>]*>/g, ' ');

  // 2) Normaliser les espaces multiples en un seul espace et trim
  const normalized = withoutHtml.replace(/\s+/g, ' ').trim();

  // 3) Découper en mots
  const words = normalized.split(' ');

  // 4) Si moins ou égal à N mots -> renvoyer tout le texte (sans ajouter "...")
  if (words.length <= N) {
    return normalized;
  }

  // 5) Sinon renvoyer les N premiers mots + "..."
  return words.slice(0, N).join(' ') + '...';
}


  /** 🔹 Suivi des changements de page (pagination) */
  logPageChange(category: string, page: number): void {
    console.log(`Page changée pour ${category}: ${page}`);
  }
}
