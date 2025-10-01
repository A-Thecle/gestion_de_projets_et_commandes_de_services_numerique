import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjetsService } from '../projet/projet.service';
import { MessagesService } from '../messages.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule],
  selector: 'app-admin-messaging',
  templateUrl: './admin-messaging.component.html',
  styleUrls: ['./admin-messaging.component.css']
})
export class AdminMessagingComponent implements OnInit, OnDestroy {
  projets: any[] = [];
  projetSelectionne: any;
  messages: any[] = [];
  nouveauMessage: string = '';
  compteNonLus: number = 0;
  userId: number | null = null;
  fichier: File | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private projetsService: ProjetsService,
    private messagesService: MessagesService,
    private authService: AuthService,
    private http : HttpClient
  ) {
    
  }
ngOnInit() {
  this.userId = this.authService.getUserId();
  if (this.userId === null) return;

  // 1️⃣ Charger tous les projets
  const sub1 = this.projetsService.getAllProjets().subscribe(projets => {
    this.projets = projets;

    // Charger les compteurs non lus par projet
    const sub1b = this.messagesService.obtenirNombreNonLusParProjet().subscribe(res => {
      this.projets.forEach(p => {
        p.nonLus = res[p.projet_id] || 0;
      });

      // Trier les projets : ceux avec des messages non lus passent en haut
      this.projets.sort((a, b) => b.nonLus - a.nonLus);
    });
    this.subscriptions.push(sub1b);
  });
  this.subscriptions.push(sub1);

  // 2️⃣ Écouter les nouveaux messages via WebSocket
  const sub2 = this.messagesService.surNouveauMessage().subscribe(msg => {
    // Trouver le projet correspondant
    const projetIndex = this.projets.findIndex(p => p.projet_id === msg.projet.projet_id);
    if (projetIndex > -1) {
      // Ajouter 1 au compteur non lus
      this.projets[projetIndex].nonLus = (this.projets[projetIndex].nonLus || 0) + 1;

      // Trier les projets pour mettre celui-ci en premier
      this.projets.sort((a, b) => b.nonLus - a.nonLus);
    }

    // Si le projet sélectionné est le même, afficher directement le message
    if (this.projetSelectionne?.projet_id === msg.projet.projet_id) {
      this.messages.push(msg);
    }
  });
  this.subscriptions.push(sub2);

  // 3️⃣ Écouter les mises à jour du compteur global
  const sub3 = this.messagesService.surMiseAJourNonLus().subscribe(() => {
    const sub4 = this.messagesService.obtenirNombreNonLus().subscribe(res => {
      this.compteNonLus = res.compte;
    });
    this.subscriptions.push(sub4);
  });
  this.subscriptions.push(sub3);
}

fichierSelectionne(event: any) {
  if (event.target.files && event.target.files.length > 0) {
    this.fichier = event.target.files[0];
  } else {
    this.fichier = null;
  }
}
downloadFile(fileName: string) {
  // On récupère le token JWT pour l'authentification
  const token = localStorage.getItem('token'); 

  // On construit l'URL vers ton backend NestJS
  // ATTENTION: fileName doit être juste "fleur2.jpeg-1757...jpeg"
  const url = `http://localhost:3000/messages/download/${fileName}`;

  // On fait une requête GET pour récupérer le fichier en tant que blob (binaire)
  return this.http.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  }).subscribe(blob => {
    // Création d’un lien <a> virtuel pour lancer le téléchargement
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob); // URL temporaire du fichier
    a.href = objectUrl;
    a.download = fileName; // Nom sous lequel le fichier sera enregistré
    a.click(); // Simule un clic utilisateur → déclenche le téléchargement
    URL.revokeObjectURL(objectUrl); // Nettoie l'URL temporaire
  });
}


selectionnerProjet(projet: any) {
  this.projetSelectionne = projet;

  // ✅ Remettre le compteur de non lus du projet à 0
  const projetIndex = this.projets.findIndex(p => p.projet_id === projet.projet_id);
  if (projetIndex > -1) {
    this.projets[projetIndex].nonLus = 0;
  }

  // 1️⃣ Rejoindre le chat via WebSocket
  this.messagesService.rejoindreChatProjet(projet.projet_id);

  // 2️⃣ Charger les messages du projet
  const sub = this.messagesService.obtenirMessagesPourProjet(projet.projet_id).subscribe(msgs => {
    this.messages = msgs;

    // Facultatif : recharger le compteur global de messages non lus
    this.chargerNonLus();
  });
  this.subscriptions.push(sub);

  // 3️⃣ WebSocket pour recevoir de nouveaux messages
  const sub2 = this.messagesService.surNouveauMessage().subscribe(msg => {
    if (msg.projet.projet_id === projet.projet_id) {
      this.messages.push(msg);
    }
  });
  this.subscriptions.push(sub2);

  // 4️⃣ WebSocket pour mise à jour du compteur global
  const sub3 = this.messagesService.surMiseAJourNonLus().subscribe(() => {
    const sub4 = this.messagesService.obtenirNombreNonLus().subscribe(res => {
      this.compteNonLus = res.compte;
    });
    this.subscriptions.push(sub4);
  });
  this.subscriptions.push(sub3);
}




 envoyerMessage() {
  if (!this.nouveauMessage && !this.fichier) return; // au moins un contenu ou un fichier
  const idDestinataire = this.projetSelectionne.commande.client.id;

  const sub = this.messagesService
    .envoyerMessage(this.nouveauMessage, this.projetSelectionne.projet_id, idDestinataire, this.fichier || undefined)
    .subscribe(msg => {
      this.messages.push(msg);
      this.nouveauMessage = '';
      this.fichier = null; // reset après envoi
    });
  this.subscriptions.push(sub);
}


  chargerNonLus() {
    const sub9 = this.messagesService.obtenirNombreNonLus().subscribe(res => {
      this.compteNonLus = res.compte;
    });
    this.subscriptions.push(sub9);
  }

  

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}