import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-suppression',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './dialog-suppression.component.html',
  styleUrls: ['./dialog-suppression.component.css']
})
export class DialogSuppressionComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { idMessage: number, isExpediteur: boolean },
    private dialogRef: MatDialogRef<DialogSuppressionComponent>
  ) {}

  annuler() {
    this.dialogRef.close();
  }

  supprimerPourMoi() {
    this.dialogRef.close({ action: 'me' });
  }

  supprimerPourTous() {
    this.dialogRef.close({ action: 'all' });
  }
}
