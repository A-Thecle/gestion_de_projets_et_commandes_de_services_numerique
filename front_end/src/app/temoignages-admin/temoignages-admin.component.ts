import { Component, OnInit } from '@angular/core';
import { TemoignagesService, Temoignage } from '../temoignages/temoignages.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SearchService } from '../search-service.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-temoignages-admin',
  templateUrl: './temoignages-admin.component.html',
  styleUrls: ['./temoignages-admin.component.css']
})
export class TemoignagesAdminComponent implements OnInit {
  temoignages: Temoignage[] = [];
  filteredTemoignages: Temoignage[] = [];
  loading = true;
  currentPage = 1;
  itemsPerPage = 4;
  totalPages = 1;
  message = '';
  private sub!: Subscription;

  // --- Gestion modals ---
  showConfirmModal: boolean = false;
  currentAction: 'publier' | 'refuser' | null = null;
  selectedTemoignageId: number | null = null;
  showSuccessModal: boolean = false;
  successMessage: string = '';

  constructor(
    private temoignageService: TemoignagesService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.loadTemoignages();

    this.sub = this.searchService.searchTerm$.subscribe((term) => {
      this.loading = true;

      if (term && term.trim() !== '') {
        this.temoignageService.searchTemoignage(term).subscribe({
          next: (data) => {
            this.temoignages = data;
            this.currentPage = 1;
            this.totalPages = Math.ceil(this.temoignages.length / this.itemsPerPage);
            this.updateFilteredTemoignages();
            this.loading = false;
          },
          error: (err) => {
            console.error('Erreur recherche témoignages', err);
            this.loading = false;
          },
        });
      } else {
        this.loadTemoignages();
      }
    });
  }

  loadTemoignages() {
    this.loading = true;
    this.temoignageService.findAll().subscribe({
      next: (data: Temoignage[]) => {
        this.temoignages = data;
        this.updateFilteredTemoignages();
        this.totalPages = Math.ceil(this.temoignages.length / this.itemsPerPage);
        this.loading = false;
      },
      error: () => {
        this.message = 'Erreur lors du chargement des témoignages.';
        this.loading = false;
      }
    });
  }

  updateFilteredTemoignages() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredTemoignages = this.temoignages.slice(start, end);
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

  // --- Nouvelle logique avec confirmation ---
  confirmAction(temoignageId: number, action: 'publier' | 'refuser') {
    this.selectedTemoignageId = temoignageId;
    this.currentAction = action;
    this.showConfirmModal = true;
  }

  executeAction() {
    if (!this.selectedTemoignageId || !this.currentAction) return;

    const statut = this.currentAction === 'publier' ? 'publié' : 'refusé';

    this.temoignageService.updateStatus(this.selectedTemoignageId, statut).subscribe({
      next: () => {
        this.loadTemoignages();
        this.showConfirmModal = false;
        this.successMessage =
          this.currentAction === 'publier'
            ? 'Témoignage publié avec succès !'
            : 'Témoignage refusé avec succès !';
        this.showSuccessModal = true;

         setTimeout(() => {
        this.showSuccessModal = false;
      }, 3000);

        this.selectedTemoignageId = null;
        this.currentAction = null;
      },
      error: (err) => {
        console.error('Erreur lors de l\'action', err);
        this.showConfirmModal = false;
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}
