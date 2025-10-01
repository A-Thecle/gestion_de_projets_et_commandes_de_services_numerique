import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { Projet } from './projet/projet.model';

interface Message {
  id_message: string;
  contenu: string;
  expediteur: { id: number };
  destinataire: { id: number };
  projet: Projet;
  date_creation: Date;
  est_lu: boolean;
  
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private apiUrl = 'http://localhost:3000/messages';
  private socket: Socket | undefined; // Typage explicite, peut être undefined
  private sujetNouveauMessage = new Subject<Message>();
  private sujetMiseAJourNonLus = new Subject<void>();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    const token = this.authService.getToken();
    console.log('Token initial pour WebSocket:', token); // Log pour débogage
    if (token) {
      this.connecterSocket(token);
    } else {
      console.error('Aucun token disponible, redirection vers connexion');
      this.router.navigate(['/connexion']);
    }
  }

  private connecterSocket(token: string): void {
    try {
      this.socket = io('http://localhost:3000', {
        auth: { token },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connecté:', this.socket?.id);
      });
      this.socket.on('disconnect', () => {
        console.log('Socket déconnecté');
      });
      this.socket.on('connect_error', (error) => {
        console.error('Erreur de connexion WebSocket:', error.message);
        if (error.message.includes('Token')) {
          console.error('Token invalide pour WebSocket, redirection vers connexion');
          this.authService.logout();
          this.router.navigate(['/connexion']);
        }
      });
      this.socket.on('nouveauMessage', (msg: Message) => {
        console.log('Nouveau message reçu:', msg);
        this.sujetNouveauMessage.next(msg);
      });
      this.socket.on('miseAJourNonLus', () => {
        console.log('Mise à jour des non-lus reçue');
        this.sujetMiseAJourNonLus.next();
      });
    } catch (error) {
      console.error('Erreur lors de l’initialisation du socket:', error);
      this.router.navigate(['/connexion']);
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token pour HTTP:', token); // Log pour débogage
    if (!token) {
      console.error('Token manquant pour la requête HTTP, redirection vers connexion');
      this.router.navigate(['/connexion']);
      throw new Error('Token manquant. Connectez-vous d’abord.');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

envoyerMessage(
  contenu: string,
  idProjet: string,
  idDestinataire: number,
  fichier?: File
): Observable<Message> {
  const formData = new FormData();
  formData.append('contenu', contenu);
  formData.append('id_projet', idProjet);
  formData.append('id_destinataire', idDestinataire.toString());
  
  // ✅ Ajout du nom du fichier
  if (fichier) {
    formData.append('fichier', fichier, fichier.name);
  }

  return this.http
    .post<Message>(this.apiUrl, formData, { headers: this.getAuthHeaders() })
    .pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/connexion']);
        }
        return throwError(() => new Error(`Erreur ${error.status}: ${error.message}`));
      })
    );
}


  obtenirMessagesPourProjet(idProjet: string): Observable<Message[]> {
    return this.http
      .get<Message[]>(`${this.apiUrl}/projet/${idProjet}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('Token invalide pour GET /messages/projet, redirection vers connexion');
            this.authService.logout();
            this.router.navigate(['/connexion']);
          }
          return throwError(() => new Error(`Erreur ${error.status}: ${error.message}`));
        })
      );
  }

  marquerCommeLu(id: string): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/${id}/lu`, {}, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('Token invalide pour POST /messages/lu, redirection vers connexion');
            this.authService.logout();
            this.router.navigate(['/connexion']);
          }
          return throwError(() => new Error(`Erreur ${error.status}: ${error.message}`));
        })
      );
  }

  obtenirNombreNonLus(): Observable<{ compte: number }> {
    return this.http
      .get<{ compte: number }>(`${this.apiUrl}/non-lus`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('Token invalide pour GET /messages/non-lus, redirection vers connexion');
            this.authService.logout();
            this.router.navigate(['/connexion']);
          }
          return throwError(() => new Error(`Erreur ${error.status}: ${error.message}`));
        })
      );
  }

 rejoindreChatProjet(idProjet: string): void {
  if (!this.socket) {
    const token = this.authService.getToken();
    if (token) this.connecterSocket(token);
    else return console.error('Aucun token pour rejoindre le salon');
  }

  if (this.socket && this.socket.connected) {
    this.socket.emit('rejoindreChatProjet', idProjet);
  } else if (this.socket) {
    this.socket.on('connect', () => {
      this.socket!.emit('rejoindreChatProjet', idProjet);
    });
  }

  // ⚡ Dès qu'on rejoint un projet, marquer tous les messages comme lus côté backend
  const userId = this.authService.getUserId();
  if (userId) {
    this.marquerTousMessagesProjetCommeLu(idProjet).subscribe(() => {
      this.obtenirNombreNonLus().subscribe(res => {
        this.sujetMiseAJourNonLus.next();
      });
    });
  }
}



  surNouveauMessage(): Observable<Message> {
    return this.sujetNouveauMessage.asObservable();
  }

  surMiseAJourNonLus(): Observable<void> {
    return this.sujetMiseAJourNonLus.asObservable();
  }

  marquerTousMessagesProjetCommeLu(idProjet: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/projet/${idProjet}/lu`, {}, { headers: this.getAuthHeaders() });
}

obtenirNombreNonLusParProjet(): Observable<{ [projetId: string]: number }> {
  return this.http.get<{ [projetId: string]: number }>(
    `${this.apiUrl}/non-lus/projets`,
    { headers: this.getAuthHeaders() }
  );
}





}