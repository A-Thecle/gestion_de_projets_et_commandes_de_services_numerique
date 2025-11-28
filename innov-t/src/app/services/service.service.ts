import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicesEntity } from './services.model'; // on créera ce modèle

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private apiUrl = 'http://localhost:3000/services'; 

  constructor(private http: HttpClient) { }

  getAllServices(): Observable<ServicesEntity[]> {
    return this.http.get<ServicesEntity[]>(this.apiUrl);
  }

  getService(id: number): Observable<ServicesEntity> {
    return this.http.get<ServicesEntity>(`${this.apiUrl}/${id}`);
  }

  createService(service: ServicesEntity): Observable<ServicesEntity> {
    return this.http.post<ServicesEntity>(this.apiUrl, service);
  }

  updateService(id: number, service: ServicesEntity): Observable<ServicesEntity> {
    return this.http.patch<ServicesEntity>(`${this.apiUrl}/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchService(term: string): Observable<ServicesEntity[]> {
    return this.http.get<ServicesEntity[]>(`${this.apiUrl}/search?term=${term}`);
  }
}
