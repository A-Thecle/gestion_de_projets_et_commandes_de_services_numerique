import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from '../services/service.service';
import { ServicesEntity } from '../services/services.model';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-service-modal',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './add-service-modal.component.html',
  styleUrls: ['./add-service-modal.component.css']
})
export class AddServiceModalComponent {
  serviceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
      private dialogRef: MatDialogRef<AddServiceModalComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,


    private serviceService: ServiceService
  ) {
    this.serviceForm = this.fb.group({
      nom_service: ['', [Validators.required, Validators.minLength(3)]],
      description_service: ['', [Validators.required, Validators.minLength(10)]],
      prix_minimum: [0, [Validators.required, Validators.min(1)]]

    });
  }

  createService(): void {
    if (this.serviceForm.valid) {
      const newService: ServicesEntity = this.serviceForm.value;
      this.serviceService.createService(newService).subscribe({
        next: (service) => {
          this.dialogRef.close(service); // Renvoie le nouveau service créé
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du service', error);
          this.dialogRef.close();
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}