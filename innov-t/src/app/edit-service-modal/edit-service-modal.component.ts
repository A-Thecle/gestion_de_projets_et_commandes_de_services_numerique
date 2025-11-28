import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from '../services/service.service';
import { ServicesEntity } from '../services/services.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone : true,
  imports : [CommonModule, MatButtonModule, MatDialogModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule, MatIconModule],
  selector: 'app-edit-service-modal',
  templateUrl: './edit-service-modal.component.html',
  styleUrls: ['./edit-service-modal.component.css']
})
export class EditServiceModalComponent {
  serviceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditServiceModalComponent>,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) public data: ServicesEntity
  ) {
    this.serviceForm = this.fb.group({
      nom_service: [data.nom_service, [Validators.required, Validators.minLength(3)]],
      description_service: [data.description_service, [Validators.required, Validators.minLength(10)]],
      prix_minimum: [data.prix_minimum, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
      const updatedService: ServicesEntity = {
        ...this.data,
        ...this.serviceForm.value
      };
      this.serviceService.updateService(this.data.service_id, updatedService).subscribe({
        next: (service) => {
          this.dialogRef.close(service); // Renvoie le service mis à jour
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du service', error);
          this.dialogRef.close();
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}