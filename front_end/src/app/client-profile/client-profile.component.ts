import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../client/client.service';
import { CommandesService } from '../commande/commande.service';
import { ProjetsService } from '../projet/projet.service';
import { AuthService } from '../auth/auth.service';
import { Client } from '../client/client.model';
import { Commande } from '../commande/commande.model';
import { Projet } from '../projet/projet.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent implements OnInit {
  client: Client | null = null;
  commandes: Commande[] = [];
  projets: Projet[] = [];
  profileForm: FormGroup;
  loading: boolean = true;

  constructor(
    private clientService: ClientService,
    private commandesService: CommandesService,
    private projetsService: ProjetsService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      prenom: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^\+?\d{10,15}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    const clientId = this.authService.getUserId();
    if (clientId) {
      this.clientService.getClientById(clientId).subscribe({
        next: (client) => {
          this.client = client;
          this.profileForm.patchValue({
            nom: client.nom,
            prenom: client.prenom,
            email: client.email,
            telephone: client.telephone
          });
          this.loadCommandes();
          this.loadProjets();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil', error);
          this.loading = false;
        }
      });
    } else {
      console.error('Utilisateur non connecté');
      this.loading = false;
    }
  }

  loadCommandes(): void {
    this.commandesService.getMyCommandes().subscribe({
      next: (commandes) => {
        
        this.commandes = commandes.sort((a, b) => 
          new Date(b.date_commande).getTime() - new Date(a.date_commande).getTime()
        );
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes', error);
      }
    });
  }

  loadProjets(): void {
    this.projetsService.getMyProjets().subscribe({
      next: (projets) => {
        this.projets = projets;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets', error);
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.client) {
      const updatedClient: Partial<Client> = {
        nom: this.profileForm.value.nom,
        prenom: this.profileForm.value.prenom,
        email: this.profileForm.value.email,
        telephone: this.profileForm.value.telephone
      };
      this.clientService.updateClient(this.client.id, updatedClient).subscribe({
        next: (client) => {
          this.client = client;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du profil', error);
        }
      });
    }
  }
}