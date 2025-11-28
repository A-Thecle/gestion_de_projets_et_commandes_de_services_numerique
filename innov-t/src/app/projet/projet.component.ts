import { Component, OnInit } from '@angular/core';
import { ProjetsService } from './projet.service';
import { Projet } from './projet.model';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { ProjetEditDialogComponent } from '../projet-edit-dialog/projet-edit-dialog.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { Subscription } from 'rxjs';
import { SearchService } from '../search-service.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-projet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    NgxPaginationModule
  ],
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.css'],
})
export class ProjetComponent implements OnInit {
  projets: Projet[] = [];
  loading = true;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  private search!: Subscription;
  private sub!: Subscription;
  showSuccessModal = false;   
  successMessage = '';  
  showDescriptionModal: boolean = false; 
  selectedDescription: string = ''; 

  constructor(
    private projetsService: ProjetsService,
    private dialog: MatDialog,
    private searchService : SearchService
  ) {}

  ngOnInit(): void {
  this.getAllProjets();
  this.sub = this.searchService.searchTerm$.subscribe((term) => {
    if (term && term.trim() !== '') {
      this.loading = true;
      this.projetsService.searchProjet(term).subscribe({
        next: (data) => {
          console.log('Documents partagés :', data.map(p => p.documents_partages)); // Ajout pour débogage
          this.projets = this.sortByDate(this.normalizeDocuments(data));
          this.loading = false;
          this.currentPage = 1;
        },
        error: (err) => {
          console.error('Erreur recherche projets', err);
          this.loading = false;
        },
      });
    } else {
      this.getAllProjets();
    }
  });
}

getAllProjets(): void {
  this.projetsService.getAllProjets().subscribe({
    next: (data) => {
      // Trie aussi à l'initialisation
      this.projets = this.sortByDate(this.normalizeDocuments(data));
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des projets', err);
      this.loading = false;
    },
  });
}

private normalizeDocuments(projets: Projet[]): Projet[] {
  return projets.map((projet) => ({
    ...projet,
    documents_partages: projet.documents_partages
      ? Array.isArray(projet.documents_partages)
        ? projet.documents_partages
        : [projet.documents_partages] // ✅ transforme une string en tableau
      : []
  }));
}
encodeFileUrl(filePath: string): string {
  if (!filePath) return '';
  // Encoder le nom du fichier et ajouter le préfixe /uploads/
  const fileName = encodeURIComponent(filePath.split('/').pop() || filePath);
  return `http://localhost:3000/uploads/${fileName}`;
}

getFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}



  openEditDialog(projet: Projet) {
    const dialogRef = this.dialog.open(ProjetEditDialogComponent, {
      width: '500px',
      data: { ...projet },
    });

    dialogRef.afterClosed().subscribe((result: Partial<Projet> | undefined) => {
      if (result) {
        this.projetsService.updateProjet(projet.projet_id, result).subscribe({
          next: (updatedProjet) => {
            const index = this.projets.findIndex((p) => p.projet_id === projet.projet_id);
            if (index !== -1) this.projets[index] = updatedProjet;

            
            this.successMessage = 'Projet modifié avec succès !';
            this.showSuccessModal = true;

           
            setTimeout(() => {
              this.showSuccessModal = false;
            }, 3000);
          },
          error: (err) => console.error('Erreur lors de la mise à jour', err),
        });
      }
    });
  }

  deleteProjet(projet: any) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '350px',
      data: { titre: projet.titre_projet },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projetsService.deleteProjet(projet.projet_id).subscribe({
         next: () => {
              this.successMessage = "Projet supprimé avec succès !";
              this.showSuccessModal = true;

  
              setTimeout(() => {
                this.getAllProjets();
                this.showSuccessModal = false;
              }, 2500);
},

         
          error: (err) => console.error('Erreur suppression :', err),
        });
      }
    });
  }

  // Nouvelle méthode pour ouvrir le modal de description
  openDescriptionModal(description: string): void {
    this.selectedDescription = description;
    this.showDescriptionModal = true;
  }

  // Nouvelle méthode pour fermer le modal de description
  closeDescriptionModal(): void {
    this.showDescriptionModal = false;
    this.selectedDescription = '';
  }

   get paginatedProjet(): Projet[] {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.projets.slice(start, start + this.itemsPerPage);
    }
  
    get totalPages(): number {
      return Math.ceil(this.projets.length / this.itemsPerPage);
    }
  
    goToPage(page: number): void {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  
    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }
  
    prevPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }


  private sortByDate(projets: Projet[]): Projet[] {
  return [...projets].sort((a, b) => {
    const dateA = a.commande?.date_commande
      ? new Date(a.commande.date_commande).getTime()
      : 0;
    const dateB = b.commande?.date_commande
      ? new Date(b.commande.date_commande).getTime()
      : 0;
    return dateB - dateA;
  });
}


  closeSuccessModal() {
    this.showSuccessModal = false;
  }

}