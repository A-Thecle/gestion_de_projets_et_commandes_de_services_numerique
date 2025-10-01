import { Component, OnInit } from '@angular/core';
import { ServicesEntity } from '../services/services.model';
import { ServiceService } from '../services/service.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TemoignagesService , Temoignage} from '../temoignages/temoignages.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-temoignage.component.html',
  styleUrl: './public-temoignage.component.css'
})
export class PublicTemoignageComponent implements OnInit {
   services: ServicesEntity[] = [];
    publishedTemoignages: Temoignage[] = [];
      filteredTemoignages: Temoignage[] = [];
  loading = true;
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

   constructor(
    private serviceService: ServiceService,
    private temoignageService : TemoignagesService
  )
    {}

   ngOnInit(): void {
      
        this.getPublishedTemoignages();
   }

  getStars(note: number): number[] {
  // Crée un tableau de taille `note`, ex: [0,1,2] si note = 3
  return Array(note).fill(0);
}

getEmptyStars(note: number): number[] {
  // Complète jusqu’à 5 avec des étoiles vides
  return Array(5 - note).fill(0);
}


    getPublishedTemoignages(): void {
    this.temoignageService.getPublished().subscribe({
      next: data => this.publishedTemoignages = data.slice(0, 3), // extrait 3 témoignages
      error: err => {
        console.error('Erreur lors de la récupération des témoignages publiés', err);
        this.publishedTemoignages = [];
      }
    });
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

  

}
