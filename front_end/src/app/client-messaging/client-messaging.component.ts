import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjetsService } from '../projet/projet.service'; // Vérifiez le chemin
import { MessagesService } from '../messages.service'; // Vérifiez le chemin
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, HttpClientModule],
  selector: 'app-client-messaging',
  templateUrl: './client-messaging.component.html',
  styleUrls: ['./client-messaging.component.css']
})
export class ClientMessagingComponent implements OnInit, OnDestroy {
  projets: any[] = [];
  projetSelectionne: any;
  messages: any[] = [];
  nouveauMessage: string = '';
  idAdmin = 1; // À remplacer par une récupération dynamique
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
    this.userId = this.authService.getUserId(); // Initialiser l'ID utilisateur
  }

ngOnInit() {
  this.userId = this.authService.getUserId();
  if (this.userId === null) return;

  // 1️⃣ Charger tous les projets du client
  const sub1 = this.projetsService.getMyProjets().subscribe(projets => {
    this.projets = projets;

    // Charger les compteurs non lus par projet
    const sub1b = this.messagesService.obtenirNombreNonLusParProjet().subscribe(res => {
      this.projets.forEach(p => {
        p.nonLus = res[p.projet_id] || 0;
      });

      // Trier pour mettre les projets avec messages non lus en haut
      this.projets.sort((a, b) => b.nonLus - a.nonLus);
    });
    this.subscriptions.push(sub1b);
  });
  this.subscriptions.push(sub1);

  // 2️⃣ Écouter les nouveaux messages via WebSocket
  const sub2 = this.messagesService.surNouveauMessage().subscribe(msg => {
    // Mettre à jour le compteur non lus pour le projet correspondant
    const projetIndex = this.projets.findIndex(p => p.projet_id === msg.projet.projet_id);
    if (projetIndex > -1) {
      // Ajouter 1 au compteur non lus
      this.projets[projetIndex].nonLus = (this.projets[projetIndex].nonLus || 0) + 1;

      // Trier le tableau pour mettre ce projet en premier
      this.projets.sort((a, b) => b.nonLus - a.nonLus);
    }

    // Si le projet sélectionné est le même, ajouter le message à la liste
    if (this.projetSelectionne?.projet_id === msg.projet.projet_id) {
      this.messages.push(msg);

      // Marquer comme lu si le message est pour cet utilisateur
      if (!msg.est_lu && msg.destinataire.id === this.userId) {
        this.messagesService.marquerCommeLu(msg.id_message).subscribe(() => this.chargerNonLus());
      }
    }
  });
  this.subscriptions.push(sub2);
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



supprimerFichier() {
    this.fichier = null; // Réinitialiser le fichier sélectionné
  }


selectionnerProjet(projet: any) {
  this.projetSelectionne = projet;
  this.messagesService.rejoindreChatProjet(projet.projet_id);

  // ✅ Remettre le compteur de non lus du projet à 0
  const projetIndex = this.projets.findIndex(p => p.projet_id === projet.projet_id);
  if (projetIndex > -1) {
    this.projets[projetIndex].nonLus = 0;
  }

  // 1️⃣ Récupérer les messages
  const sub5 = this.messagesService.obtenirMessagesPourProjet(projet.projet_id).subscribe(msgs => {
    this.messages = msgs;

    // 2️⃣ Marquer tous les messages non lus du projet comme lus via l'API
    this.messagesService.marquerTousMessagesProjetCommeLu(projet.projet_id).subscribe(() => {
      // Facultatif : recharger le compteur global de messages non lus
      this.chargerNonLus();
    });
  });
  this.subscriptions.push(sub5);

  // 3️⃣ WebSocket pour les nouveaux messages
  const sub6 = this.messagesService.surNouveauMessage().subscribe(msg => {
    this.messages.push(msg);
    if (msg.destinataire.id === this.userId && !msg.est_lu) {
      this.messagesService.marquerCommeLu(msg.id_message).subscribe(() => this.chargerNonLus());
    }
  });
  this.subscriptions.push(sub6);
}




envoyerMessage() {
  if (!this.nouveauMessage && !this.fichier) return; // au moins un contenu ou un fichier
  const idDestinataire = this.projetSelectionne.commande.client.id;

  const sub = this.messagesService
    .envoyerMessage(this.nouveauMessage, this.projetSelectionne.projet_id, 2, this.fichier || undefined)
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