import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MessagesService } from '../../messages.service';
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../notification/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { io } from 'socket.io-client'; 
import { SearchService } from '../../search-service.service';

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isClientsOpen = false;
  showLogoutModal = false;
  searchTerm: string = '';
  search$ = new Subject<string>();
  currentPage: string = '';
  compteMessagesNonLus: number = 0;
  private subscriptions: Subscription[] = [];
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showNotifications: boolean = false;
  private socket: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messagesService: MessagesService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private searchService: SearchService
  ) {
    
  }

ngOnInit() {
  if (this.authService.isLoggedIn()) {
    // compteur messages non lus
    const sub1 = this.messagesService.obtenirNombreNonLus().subscribe({
      next: (res) => {
        console.log('Compteur non lus admin:', res.compte);
        this.compteMessagesNonLus = res.compte;
      },
      error: (err) => console.error('Erreur lors de la récupération des non-lus admin:', err)
    });
    this.subscriptions.push(sub1);

    // mise à jour compteur
    const sub2 = this.messagesService.surMiseAJourNonLus().subscribe(() => {
      const sub3 = this.messagesService.obtenirNombreNonLus().subscribe(res => {
        console.log('Mise à jour compteur non lus admin:', res.compte);
        this.compteMessagesNonLus = res.compte;
      });
      this.subscriptions.push(sub3);
    });
    this.subscriptions.push(sub2);

    // 🔴 Correction : utiliser NotificationService
    const userId = this.authService.getUserId();
    if (userId) {
      // récupérer les notifications existantes
      const sub4 = this.notificationService.getUserNotifications(userId).subscribe({
        next: (data) => {
          this.notifications = data;
          this.unreadCount = data.filter(n => !n.isRead).length;
        },
        error: (err) => console.error('Erreur lors du chargement notifications admin:', err)
      });
      this.subscriptions.push(sub4);

      // écouter les nouvelles notifications
      const sub5 = this.notificationService.getNewNotification().subscribe((notification) => {
        this.notifications.unshift(notification);
        this.unreadCount++;
        this.showNotification(notification.message);
      });
      this.subscriptions.push(sub5);
    }
  }
}


  toggleClientsMenu() {
    this.isClientsOpen = !this.isClientsOpen;
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

 onSearchChange() {
  const term = this.searchTerm.trim();
  this.search$.next(term);
  this.searchService.setSearchTerm(term);  // ✅ diffuse dans toute l’app
}

  ngOnDestroy() {
    this.search$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.socket) this.socket.disconnect();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
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
}