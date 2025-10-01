import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Temoignage {
  id_temoignage?: number;
  id_client?: number;
  id_projet: string;
  note: number;
  commentaire: string;
  date_soumission?: Date;
  statut_temoignage : String
  client?: { id: number; nom: string; prenom?: string; email?: string }; // Relation avec le client
  projet?: { projet_id: string; titre_projet: string }; // Relation avec le projet
}

@Injectable({ providedIn: 'root' })
export class TemoignagesService {
  private apiUrl = 'http://localhost:3000/temoignages';

  constructor(private http: HttpClient) {}

  createTemoignage(data: Temoignage): Observable<Temoignage> {
    const token = localStorage.getItem('token'); // ou via ton AuthService
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<Temoignage>(this.apiUrl, data, { headers });
  }

  getTemoignagesByProjet(projetId: string): Observable<Temoignage[]> {
    return this.http.get<Temoignage[]>(`${this.apiUrl}/projet/${projetId}`);
  }
findAll(): Observable<Temoignage[]> {
    return this.http.get<Temoignage[]>(`${this.apiUrl}?include=client,projet`); 
  }

  updateStatus(id: number, statut: string): Observable<Temoignage> {
  return this.http.patch<Temoignage>(`${this.apiUrl}/${id}/status`, { statut });
}

  getPublished(): Observable<Temoignage[]> {
    return this.http.get<Temoignage[]>(`${this.apiUrl}/publies`);
  }

  
    searchTemoignage(term: string): Observable<Temoignage[]> {
      return this.http.get<Temoignage[]>(`${this.apiUrl}/search`, {
        params: { term }
      });
}

}
