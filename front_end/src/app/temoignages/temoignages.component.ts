import { Component, OnInit , NgZone} from '@angular/core';
import { TemoignagesService, Temoignage } from './temoignages.service';
import { ProjetsService } from '../projet/projet.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-temoignages',
  templateUrl: './temoignages.component.html',
  styleUrls: ['./temoignages.component.css']
})
export class TemoignagesComponent implements OnInit {
   temoignage: Temoignage = {
    id_client: 0,
    id_projet: '',
    note: 0,
    commentaire: '',
    statut_temoignage: 'en_attente'
  };
  projets: any[] = [];   
  message = '';
  showPopup = false;
  showConfirmation: boolean= false;

   publishedTemoignages: Temoignage[] = [];
      filteredTemoignages: Temoignage[] = [];
  loading = true;
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  constructor(
    private temoignageService: TemoignagesService,
    private projetsService: ProjetsService,
    private authService: AuthService,
    private ngZone: NgZone,
    private router: Router, 
  ) {}

  ngOnInit() {
    // Récupérer l’utilisateur connecté
    const clientId = this.authService.getUserId();
    if (clientId) {
      this.temoignage.id_client = clientId;

      // Charger les projets terminés du client
      this.projetsService.getMyProjets().subscribe({
        next: (allProjets) => {
          // On garde seulement les projets terminés
          this.projets = allProjets.filter(p => p.etat === 'termine');
          if (this.projets.length > 0) {
            this.temoignage.id_projet = this.projets[0].projet_id; // pré-sélection
          }
        },
        error: () => this.message = "Impossible de charger vos projets."
      });
    }

    
  // ⚡ Charger les témoignages publiés dès le début
  this.getPublishedTemoignages();
  }

  envoyer() {
  const clientId = this.authService.getUserId();
  this.temoignage.id_client = clientId ?? undefined;


  if (!this.temoignage.id_projet) {
    this.message = 'Vous devez choisir un projet terminé.';
    return;
  }

  if (this.temoignage.note < 1 || this.temoignage.note > 5) {
    this.message = 'La note doit être entre 1 et 5.';
    return;
  }

  console.log("Payload envoyé:", this.temoignage); // 🔎 debug

  this.temoignageService.createTemoignage(this.temoignage).subscribe({
    next: () => {
      this.ngZone.run(() => {
        this.showConfirmation = true;
      });
    },
    error: (err) => {
      console.error(err);
      this.message = "Erreur lors de l'envoi du témoignage.";
    }
  });
}


    getPublishedTemoignages(): void {
    this.temoignageService.getPublished().subscribe({
      next: data => this.publishedTemoignages = data, // extrait 3 témoignages
      error: err => {
        console.error('Erreur lors de la récupération des témoignages publiés', err);
        this.publishedTemoignages = [];
      }
    });
  }
    getStars(note: number): number[] {
  // Crée un tableau de taille `note`, ex: [0,1,2] si note = 3
  return Array(note).fill(0);
}

getEmptyStars(note: number): number[] {
  // Complète jusqu’à 5 avec des étoiles vides
  return Array(5 - note).fill(0);
}

   updateFilteredTemoignages() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredTemoignages = this.publishedTemoignages.slice(start, end);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateFilteredTemoignages();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateFilteredTemoignages();
    }
  }


  
  closeConfirmation(): void {
    this.showConfirmation = false;
    this.router.navigate(['/client/home']);
  }
}
