import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from './projet.model';
import { AuthService } from '../auth/auth.service';
import { SearchService } from '../search-service.service';


@Injectable({
  providedIn: 'root'
})
export class ProjetsService {
  currentPage: number = 1;
  itemsPerPage: number = 4;

  private apiUrl = 'http://localhost:3000/projets'; 

  constructor(
    private http: HttpClient, private authService:AuthService,
    private searchService : SearchService

  ) {}


  

  getAllProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.apiUrl);
  }

  
updateProjet(id: string, projet: Partial<Projet>): Observable<Projet> {
  return this.http.patch<Projet>(`${this.apiUrl}/${id}`, projet);
}



  deleteProjet(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  getMyProjets(): Observable<Projet[]> {
    const clientId = this.authService.getUserId(); 
    return this.http.get<Projet[]>(`${this.apiUrl}/client/${clientId}`);
  }

  searchProjet(term: string): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.apiUrl}/search`, {
      params: { term }
    });
  }

  
  countProjetsEnCours(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/projetEncours`);
  }

  countProjetsTermines(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/projetTermine`);
  }
}

 






