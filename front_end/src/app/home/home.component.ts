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
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
   services: ServicesEntity[] = [];
    publishedTemoignages: Temoignage[] = [];

   constructor(
    private serviceService: ServiceService,
    private temoignageService : TemoignagesService
  )
    {}

   ngOnInit(): void {
      this.getAllServices();
        this.getPublishedTemoignages();
   }
   getAllServices(): void {
    this.serviceService.getAllServices().subscribe(data => {
      this.services = data.slice(0, 3);
    }, error => {
      console.error('Erreur lors de la récupération des services', error);
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


    getPublishedTemoignages(): void {
    this.temoignageService.getPublished().subscribe({
      next: data => this.publishedTemoignages = data.slice(0, 2), // extrait 3 témoignages
      error: err => {
        console.error('Erreur lors de la récupération des témoignages publiés', err);
        this.publishedTemoignages = [];
      }
    });
  }

}
