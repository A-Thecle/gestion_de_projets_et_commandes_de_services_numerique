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
  formatClientPhone(phone: string | number | null | undefined): string {
  if (!phone) return '';

  // Convertir en string et supprimer les espaces
  let phoneStr = String(phone).replace(/\s+/g, '');

  // Extraire le préfixe (ex: +261, +33, etc.)
  let prefix = '';
  let number = phoneStr;

  const prefixMatch = phoneStr.match(/^(\+\d{1,3})(\d+)/);
  if (prefixMatch) {
    prefix = prefixMatch[1]; // +261
    number = prefixMatch[2]; // reste du numéro
  }

  // Vérifier que le numéro a au moins 12 chiffres (ou plus)
  if (number.length < 12) return prefix ? `${prefix} ${number}` : number;

  // Formater exactement en blocs 3 2 2 3 2
  const part1 = number.substring(0, 3);
  const part2 = number.substring(3, 5);
  const part3 = number.substring(5, 7);
  const part4 = number.substring(7, 10);
  const part5 = number.substring(10, 12);

  const formatted = `${part1} ${part2} ${part3} ${part4} ${part5}`;

  return prefix ? `${prefix} ${formatted}` : formatted;
}



  close(): void {
    this.dialogRef.close();
  }
}
