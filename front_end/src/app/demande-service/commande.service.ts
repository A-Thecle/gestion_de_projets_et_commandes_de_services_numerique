import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from './commande.model';



@Injectable({
  providedIn: 'root'
})
export class CommandesService {
  private apiUrl = 'http://localhost:3000/commandes'; // ajustez selon votre backend

  constructor(private http: HttpClient) {}

  createCommande(formData: FormData) {
  return this.http.post<Commande>('http://localhost:3000/commandes', formData);
}


  getAllCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
  }

  getCommande(id: string): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }
}
