import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Projet } from '../projet/projet.model';

import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';






@Component({
  standalone : true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatSelectModule],
  selector: 'app-projet-edit-dialog',
  templateUrl: './projet-edit-dialog.component.html',
  styleUrls: ['./projet-edit-dialog.component.css']
})
export class ProjetEditDialogComponent {
  projetForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ProjetEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Projet,
    private fb: FormBuilder
  ) {
    this.projetForm = this.fb.group({
      titre_projet: [data.titre_projet, Validators.required],
      description_projet: [data.description_projet],
      etat: [data.etat],
        date_livraison_prevue: [this.formatDate(data.date_livraison_prevue)]
    });
  }

  onSaveEdit() {
    if (this.projetForm.valid) {
      this.dialogRef.close(this.projetForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  private formatDate(date: string | Date | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
}
