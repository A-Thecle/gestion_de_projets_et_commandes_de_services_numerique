import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Utilisateur } from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private token: string | null = null;

  constructor(private http: HttpClient) {
    // Charger le token depuis localStorage au démarrage
    this.token = localStorage.getItem('token');
    console.log('Token chargé au démarrage:', this.token); // Log pour débogage
  }

  login(credentials: { emailOrPhone: string; mot_de_passe: string }): Observable<{ access_token: string; utilisateur: Utilisateur }> {
    return this.http
      .post<{ access_token: string; utilisateur: Utilisateur }>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('Réponse API login:', response);
          if (response && response.access_token && response.utilisateur) {
            this.token = response.access_token;
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('utilisateur', JSON.stringify(response.utilisateur));
          } else {
            throw new Error('Réponse du serveur invalide');
          }
        }),
        catchError(this.handleError)
      );
  }

  getToken(): string | null {
    const token = this.token || localStorage.getItem('token');
    console.log('Token récupéré par getToken:', token); // Log pour débogage
    return token;
  }

  getUserConnected(): Utilisateur | null {
    const utilisateur = localStorage.getItem('utilisateur');
    return utilisateur ? JSON.parse(utilisateur) : null;
  }

  getUserId(): number | null {
    const utilisateur = this.getUserConnected();
    const userId = utilisateur ? utilisateur.id : null;
    console.log('UserId récupéré:', userId); // Log pour débogage
    return userId;
  }

  getUserPrenom(): string | null {
    const utilisateur = this.getUserConnected();
    return utilisateur ? utilisateur.prenom : null;
  }

  createUser(userData: {
    nom: string;
    prenom: string;
    email: string;
    telephone: number;
    mot_de_passe: string;
    role?: 'client' | 'admin';
  }): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/utilisateurs`, userData).pipe(catchError(this.handleError));
  }

  isLoggedIn(): boolean {
    const loggedIn = !!this.getToken();
    console.log('Utilisateur connecté:', loggedIn); // Log pour débogage
    return loggedIn;
  }

  isAdmin(): boolean {
    const utilisateur = this.getUserConnected();
    const isAdmin = utilisateur?.role === 'admin' || false;
    console.log('Utilisateur est admin:', isAdmin); // Log pour débogage
    return isAdmin;
  }

  logout(): void {
    console.log('Déconnexion: suppression du token et utilisateur'); // Log pour débogage
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Erreur ${error.status}: ${error.error?.message || error.message}`;
    }
    console.error('Erreur AuthService:', errorMessage); // Log pour débogage
    return throwError(() => new Error(errorMessage));
  }
}