import { Component, OnInit } from '@angular/core';
import { ProjetsService } from '../projet/projet.service';
import { Projet } from '../projet/projet.model';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjetDetailsDialogComponent } from '../projet-detail-dialog/projet-detail-dialog.component';

@Component({
  selector: 'app-projet-by-client',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './projet-by-client.component.html',
  styleUrls: ['./projet-by-client.component.css']
})
export class ProjetByClientComponent implements OnInit {
  projetsEnAttente: Projet[] = [];
  projetsEnCours: Projet[] = [];
  projetsEnRevision: Projet[] = [];
  projetsTermines: Projet[] = [];
  loading = true;

  constructor(
    private projetsService: ProjetsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProjets();
  }

  private loadProjets(): void {
    this.projetsService.getMyProjets().subscribe({
      next: (projets: Projet[]) => {
        console.log('Projets reçus:', projets);
        this.projetsEnAttente = projets.filter(proj => proj.etat === 'en_attente');
        this.projetsEnCours = projets.filter(proj => proj.etat === 'en_cours');
        this.projetsEnRevision = projets.filter(proj => proj.etat === 'en_revision');
        this.projetsTermines = projets.filter(proj => proj.etat === 'termine');
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

  openDetails(projet: Projet): void {
    console.log('Ouverture du modal pour projet:', projet);
    this.dialog.open(ProjetDetailsDialogComponent, {
      width: '500px',
      data: projet
    });
  }

  getFirstSentence(description: string | undefined): string {
    if (!description) return 'Aucune description disponible.';
    const sentences = description.split(/[.!?]+/); // Sépare sur ., !, ou ?
    const firstSentence = sentences[0]?.trim();
    return firstSentence ? firstSentence + '.' : 'Aucune description disponible.';
  }
}