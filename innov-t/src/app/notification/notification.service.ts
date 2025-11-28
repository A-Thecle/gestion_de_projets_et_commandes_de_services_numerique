// src/app/notification/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { Notification } from './notification.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/notifications';
  private socket: Socket;
  private notificationSubject = new Subject<Notification>();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
    });
    this.socket.on('connect', () => {
      const userId = this.authService.getUserId();
      if (userId !== null) {
        this.socket.emit('join', { userId });
      } else {
        console.error('User ID null, impossible de rejoindre la room WebSocket');
      }
    });

    this.socket.on('newNotification', (notification: Notification) => {
      this.notificationSubject.next(notification);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erreur de connexion WebSocket:', error);
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token envoyé dans les headers:', token); // Log pour déboguer
    if (!token) {
      console.error('Aucun token trouvé, requêtes non authentifiées');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http
      .get<Notification[]>(`${this.apiUrl}/${userId}`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de la récupération des notifications:', error);
          return throwError(() => new Error('Impossible de récupérer les notifications'));
        })
      );
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.http
      .get<number>(`${this.apiUrl}/${userId}/unread-count`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error('Erreur lors du comptage des notifications non lues:', error);
          return throwError(() => new Error('Impossible de compter les notifications non lues'));
        })
      );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http
      .patch<void>(`${this.apiUrl}/${notificationId}/read`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de la mise à jour de la notification:', error);
          return throwError(() => new Error('Impossible de marquer la notification comme lue'));
        })
      );
  }

  getNewNotification(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }
}