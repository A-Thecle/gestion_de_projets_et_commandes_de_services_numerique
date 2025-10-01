import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ClientService } from '../client/client.service';
import { CommonModule } from '@angular/common';
import { NgIf, NgFor } from '@angular/common';


@Component({
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, MatDialogModule],
  selector: 'app-client-modal',
  templateUrl: './client-modal.component.html',
  styleUrls: ['./client-modal.component.css']
})
export class ClientModalComponent implements OnInit {

  clientFiche: any = null;
  loading = true;

  // Pagination
  currentPage = 1;
  pageSize = 2; // Nombre de commandes par page
  totalPages = 1;
  pagedCommandes: any[] = [];

  constructor(
    private clientService: ClientService,
    private dialogRef: MatDialogRef<ClientModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { code_utilisateur: string }
  ) {}

  ngOnInit(): void {
    this.clientService.getClientFiche(this.data.code_utilisateur).subscribe({
      next: (res) => {
        this.clientFiche = res;
        this.loading = false;
        this.totalPages = Math.ceil(this.clientFiche.commandes.length / this.pageSize);
        this.updatePagedCommandes();
      },
      error: (err) => {
        console.error('Erreur récupération fiche client', err);
        this.loading = false;
      }
    });
  }

  updatePagedCommandes() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedCommandes = this.clientFiche.commandes.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedCommandes();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedCommandes();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
