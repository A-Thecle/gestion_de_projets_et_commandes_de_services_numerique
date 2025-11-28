import { Component, OnInit, NgZone } from '@angular/core';
import { TemoignagesService, Temoignage } from './temoignages.service';
import { ProjetsService } from '../projet/projet.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, MatIconModule],
  selector: 'app-temoignages',
  templateUrl: './temoignages.component.html',
  styleUrls: ['./temoignages.component.css']
})
export class TemoignagesComponent implements OnInit {
  temoignage: Temoignage = {
    id_client: 0,
    id_projet: '',
    note: null,
    commentaire: '',
    statut_temoignage: 'en_attente'
  };

  projets: any[] = [];
  message = '';
  showPopup = false;
  showConfirmation = false;
  charCount = 0;

  publishedTemoignages: Temoignage[] = [];
  clientTemoignages: Temoignage[] = []; // Stocker tous les témoignages du client

  loading = true;
  currentPage = 1;
  itemsPerPage = 6; // Synchronisé avec le template

  constructor(
    private temoignageService: TemoignagesService,
    private projetsService: ProjetsService,
    private authService: AuthService,
    private ngZone: NgZone,
    private router: Router
  ) {}
ngOnInit() {
  const clientId = this.authService.getUserId();
  if (!clientId) {
    this.message = 'Veuillez vous connecter pour laisser un témoignage.';
    this.loading = false;
    return;
  }

  this.temoignage.id_client = clientId;

  // Charger les projets disponibles pour ce client
  this.temoignageService.getAvailableProjets(clientId).subscribe({
    next: (availableProjets) => {
      this.projets = availableProjets;
      if (this.projets.length === 0) {
        this.message = 'Aucun projet disponible pour laisser un témoignage.';
      }
      this.loading = false;
    },
    error: () => {
      this.message = 'Impossible de charger vos projets.';
      this.loading = false;
    }
  });

  // Charger les témoignages publiés
  this.getPublishedTemoignages();
}


  openPopup() {
    // Réinitialiser le formulaire
    this.temoignage = {
      id_client: this.authService.getUserId() ?? 0,
      id_projet: '',
      note: null,
      commentaire: '',
      statut_temoignage: 'en_attente'
    };
    this.charCount = 0;
    this.message = '';
    this.showPopup = true;
  }

  envoyer() {
  // validation formulaire
  this.temoignageService.createTemoignage(this.temoignage).subscribe({
    next: () => {
      this.showPopup = false;
      this.showConfirmation = true;
      // supprimer le projet de la liste
      this.projets = this.projets.filter(p => p.projet_id !== this.temoignage.id_projet);
      this.getPublishedTemoignages();
      setTimeout(() => this.closeConfirmation(), 3000);
    },
    error: (err) => {
      this.message = err.error?.message || 'Erreur lors de l\'envoi du témoignage.';
    }
  });
}

  updateCharCount() {
    this.charCount = this.temoignage.commentaire.length;
  }

 getPublishedTemoignages(): void {
  this.temoignageService.getPublished().subscribe({
    next: data => {
      console.log('🟢 Témoignages publiés :', data);
      this.publishedTemoignages = data;
    },
    error: err => {
      console.error('Erreur lors de la récupération des témoignages publiés', err);
      this.publishedTemoignages = [];
    }
  });
}


  getStars(note: number): number[] {
    return Array(note).fill(0);
  }

  getEmptyStars(note: number): number[] {
    return Array(5 - note).fill(0);
  }

  closeConfirmation(): void {
    this.showConfirmation = false;
    this.router.navigate(['/client/home']);
  }
}