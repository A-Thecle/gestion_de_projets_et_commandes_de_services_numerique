import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ServicesEntity } from '../services/services.model';
import { ServiceService } from '../services/service.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TemoignagesService, Temoignage } from '../temoignages/temoignages.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('testimonialsRow') testimonialsRow!: ElementRef;

  services: ServicesEntity[] = [];
  publishedTemoignages: Temoignage[] = [];

  constructor(
    private serviceService: ServiceService,
    private temoignageService: TemoignagesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAllServices();
    this.getPublishedTemoignages();
  }

  ngAfterViewInit(): void {
    // Démarre l’animation si les témoignages sont déjà chargés
    setTimeout(() => {
      if (this.testimonialsRow) {
        this.addAnimationToTestimonials();
      }
    }, 0);
  }

  getAllServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: (data) => {
        this.services = data.slice(0, 3);
      },
      error: (error) => console.error('Erreur lors de la récupération des services', error)
    });
  }

  getPublishedTemoignages(): void {
    this.temoignageService.getPublished().subscribe({
      next: (data) => {
        this.publishedTemoignages = data.slice(0, 2);
        this.cdr.detectChanges();

        // Démarre les animations après le rendu du DOM
        if (this.testimonialsRow) {
          this.addAnimationToTestimonials();
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des témoignages publiés', err);
        this.publishedTemoignages = [];
        this.cdr.detectChanges();
      }
    });
  }

  addAnimationToTestimonials(): void {
    if (this.testimonialsRow) {
      setTimeout(() => {
        const cards = this.testimonialsRow.nativeElement.querySelectorAll('.testimonial-card');
        cards.forEach((card: HTMLElement, index: number) => {
          setTimeout(() => card.classList.add('animate-in'), index * 200);
        });
      }, 0);
    }
  }

  // Fonctions utilitaires pour les étoiles
  getStars(note: number): number[] {
    return Array(note).fill(0);
  }

  getEmptyStars(note: number): number[] {
    return Array(5 - note).fill(0);
  }

  getIconClass(index: number): string {
    switch (index) {
      case 0: return 'icon-web';
      case 1: return 'icon-mobile';
      case 2: return 'icon-dev-web';
      default: return 'icon-web';
    }
  }

  // Nouvelle méthode pour extraire les deux premières phrases
  getFirstTwoSentences(description: string): string {
    // Sépare la description en phrases (en utilisant le point comme délimiteur)
    const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
    // Prend les deux premières phrases et les joint, ou retourne la description entière si moins de 2 phrases
    return sentences.slice(0, 2).join(' ').trim() || description;
  }
}