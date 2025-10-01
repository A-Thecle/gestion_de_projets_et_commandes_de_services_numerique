// src/app/home-client/home-client.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notification/notification.service';
import { Notification } from '../notification/notification.model';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';


@Component({
  standalone : true,
  imports : [MatIconModule, MatButtonModule, CommonModule],
  selector: 'app-home-client',
  templateUrl: './home-client.component.html',
  styleUrls: ['./home-client.component.css'],
})
export class HomeClientComponent implements OnInit, OnDestroy {
  userName: string = '';
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showNotifications = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserPrenom() || 'Utilisateur';
    const userId = this.authService.getUserId(); // Suppose que c'est number | null

    if (userId === null) {
      console.error('Utilisateur non connecté');
      return; // Ou redirige vers login
    }

    // Charger les notifications initiales
    this.notificationService.getUserNotifications(userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
    });

    // Charger le nombre de notifications non lues
    this.notificationService.getUnreadCount(userId).subscribe({
      next: (count) => {
        this.unreadCount = count;
      },
    });

    // Écouter les nouvelles notifications via WebSocket
    this.subscription.add(
      this.notificationService.getNewNotification().subscribe({
        next: (notification) => {
          this.notifications.unshift(notification); // Ajouter au début
          this.unreadCount++;
          this.showNotification(notification.message);
        },
      }),
    );
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find((n) => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          this.unreadCount--;
        }
      },
    });
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}