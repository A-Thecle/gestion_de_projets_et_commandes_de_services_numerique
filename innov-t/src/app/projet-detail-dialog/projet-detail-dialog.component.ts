import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Projet } from '../projet/projet.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projet-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './projet-detail-dialog.component.html',
  styleUrls: ['./projet-detail-dialog.component.css']
})
export class ProjetDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProjetDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Projet // Récupérez les données injectées
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}