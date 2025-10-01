import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../client/client.service';
import { Client } from '../client/client.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-edit-dialog',
  standalone : true,
  imports : [MatDialogModule, MatButtonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './client-edit-dialog.component.html',
  styleUrls: ['./client-edit-dialog.component.css']
})
export class ClientEditDialogComponent implements OnInit {
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    public dialogRef: MatDialogRef<ClientEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client: Client } // client passé en param
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      nom: [this.data.client.nom, Validators.required],
      prenom: [this.data.client.prenom, Validators.required],
      email: [this.data.client.email, [Validators.required, Validators.email]],
      telephone: [this.data.client.telephone, Validators.required],
    });
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.clientService.updateClient((this.data.client as any).id, this.editForm.value).subscribe({
        next: (updatedClient) => {
          this.dialogRef.close(updatedClient); // on renvoie le client modifié au parent
        },
        error: (err) => console.error(err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
