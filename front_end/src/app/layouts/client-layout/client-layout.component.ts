import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from '../../notification/notification.service';
import { Notification } from '../../notification/notification.model';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MessagesService } from '../../messages.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.css'],
})
export class ClientLayoutComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  showLogoutModal: boolean = false;
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;
  private subscription: Subscription = new Subscription();
  compteMessagesNonLus: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private messagesService: MessagesService,
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserPrenom() || 'Utilisateur';
    const userId = this.authService.getUserId();

    if (userId === null) {
      console.error('Utilisateur non connecté');
      this.router.navigate(['/connexion']);
      return;
    }

    // Charger les notifications initiales
    this.notificationService.getUserNotifications(userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (err) => console.error('Erreur lors du chargement des notifications:', err),
    });

    // Charger le nombre de notifications non lues
    this.notificationService.getUnreadCount(userId).subscribe({
      next: (count) => {
        this.unreadCount = count;
      },
      error: (err) => console.error('Erreur lors du comptage des notifications non lues:', err),
    });

    // Écouter les nouvelles notifications via WebSocket
    this.subscription.add(
      this.notificationService.getNewNotification().subscribe({
        next: (notification) => {
          this.notifications.unshift(notification);
          this.unreadCount++;
          this.showNotification(notification.message);
        },
        error: (err) => console.error('Erreur lors de la réception de la notification:', err),
      }),
    );

    this.messagesService.obtenirNombreNonLus().subscribe(res => this.compteMessagesNonLus = res.compte);
this.messagesService.surMiseAJourNonLus().subscribe(() => {
  this.messagesService.obtenirNombreNonLus().subscribe(res => this.compteMessagesNonLus = res.compte);
});
  }

toggleNotifications(): void {
  this.showNotifications = !this.showNotifications;

  if (this.showNotifications) {
    // Marquer toutes les notifications affichées comme lues
    this.notifications
      .filter(n => !n.isRead)
      .forEach(n => this.markAsRead(n.id));
  }
}


  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find((n) => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      },
      error: (err) => console.error('Erreur lors du marquage comme lu:', err),
    });
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.showLogoutModal = false;
    this.router.navigate(['/connexion']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}