// commandes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from './commande.model';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class CommandesService {

  private apiUrl = 'http://localhost:3000/commandes'; 

  constructor(
    private http: HttpClient,
    private authService : AuthService

  ) {}

  getAllCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
}

  validerCommande(commande_id: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/valider/${commande_id}`, {});
}

refuserCommande(id: string) {
  return this.http.patch<Commande>(`${this.apiUrl}/refuser/${id}`, {});
}

searchCommandes(term: string): Observable<Commande[]> {
  return this.http.get<Commande[]>(`${this.apiUrl}/search`, {
    params: { term }
  });
}
getMyCommandes(): Observable<Commande[]> {
    const clientId = this.authService.getUserId();
    return this.http.get<Commande[]>(`${this.apiUrl}/client/${clientId}`);
  }

  // frontend Angular
countCommandesEnAttente(): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/commandeAttente`);
}



}
