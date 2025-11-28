import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ClientService } from '../client/client.service';

@Component({
  standalone: true,
  selector: 'app-client-modal',
  imports: [CommonModule, NgIf, NgFor, MatDialogModule],
  templateUrl: './client-modal.component.html',
  styleUrls: ['./client-modal.component.css']
})
export class ClientModalComponent implements OnInit {

  clientFiche: any = null;
  loading = true;
  deuxDernieresCommandes: any[] = [];

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

        if (this.clientFiche?.commandes?.length > 0) {
          // 🧠 Trier les commandes par date (la plus récente d'abord)
          this.clientFiche.commandes.sort((a: any, b: any) => {
            const dateA = new Date(a.date_commande).getTime();
            const dateB = new Date(b.date_commande).getTime();
            return dateB - dateA; // décroissant
          });

          // 🧩 Garder uniquement les 2 plus récentes
          this.deuxDernieresCommandes = this.clientFiche.commandes.slice(0, 2);
        }
      },
      error: (err) => {
        console.error('Erreur récupération fiche client', err);
        this.loading = false;
      }
    });
  }

  // ✅ Fonction pour formater le téléphone proprement
  formatClientPhone(phone: string | number | null | undefined): string {
    if (!phone) return '';

    let phoneStr = String(phone).replace(/\s+/g, '');

    let prefix = '';
    let number = phoneStr;

    const prefixMatch = phoneStr.match(/^(\+\d{1,3})(\d+)/);
    if (prefixMatch) {
      prefix = prefixMatch[1];
      number = prefixMatch[2];
    }

    if (number.length < 9) return prefix ? `${prefix} ${number}` : number;

    // Exemple format : 032 12 34 567
    const part1 = number.substring(0, 3);
    const part2 = number.substring(3, 5);
    const part3 = number.substring(5, 7);
    const part4 = number.substring(7);

    const formatted = `${part1} ${part2} ${part3} ${part4}`;
    return prefix ? `${prefix} ${formatted}` : formatted;
  }

  // ✅ Fermer la fenêtre
  close(): void {
    this.dialogRef.close();
  }
}
