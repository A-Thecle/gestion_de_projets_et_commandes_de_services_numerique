import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from './client.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = 'http://localhost:3000/utilisateurs';

  constructor(private http: HttpClient) {}

  getAllClient(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }
   getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  getClientFiche(code_utilisateur: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${code_utilisateur}/fiche`);
  }

  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchClient(term: string): Observable<Client[]> {
    if (!term.trim()) {
      return this.getAllClient();
    }
    const params = new HttpParams().set('term', term);
    return this.http.get<Client[]>(`${this.apiUrl}/search`, { params });
  }
}