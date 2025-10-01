import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from 'src/auth/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly notificationService: NotificationService,
    private jwtService: JwtService,
  ) {}

  // Middleware pour authentifier et décoder le token
  afterInit(server: Server) {
    server.use((socket: Socket, next) => {
      const token = socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new WsException('Aucun token fourni'));
      }
      try {
        const payload = this.jwtService.verify(token);
        socket.handshake.query.userId = payload.id;
        socket.handshake.query.role = payload.role; // Ajout du rôle
        next();
      } catch (error) {
        return next(new WsException('Token invalide'));
      }
    });
  }

  async handleConnection(client: Socket) {
    console.log(`Client connecté: ${client.id}`);
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;

    if (userId) {
      client.join(`user_${userId}`);
      console.log(`Client ${client.id} a rejoint la room user_${userId}`);
    }

    if (role === 'admin') {
      client.join('admins');
      console.log(`Client ${client.id} a rejoint la room admins`);
    } else {
      console.warn('Aucun rôle admin détecté pour le client:', client.id);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client déconnecté: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { userId: number }) {
    console.log(`Client ${client.id} rejoint la room user_${payload.userId}`);
    client.join(`user_${payload.userId}`);
  }

 async sendNotification(userId: number, message: string, type: string) {
  try {
    // 🔹 1. Sauvegarde en BDD
    const notification = await this.notificationService.createNotification(userId, message, type);

    // 🔹 2. Envoi en temps réel
    this.server.to(`user_${userId}`).emit('newNotification', notification);

    console.log(`Notification enregistrée et émise à user_${userId}`);
    return notification;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    throw error;
  }
}

async sendNotificationToAdmins(message: string, type: string) {
  try {
    // 🔹 1. Récupérer tous les admins en DB
    const admins = await this.notificationService.findAdmins(); // méthode qu'on ajoute
    const savedNotifications = [];

    for (const admin of admins) {
      const notif = await this.notificationService.createNotification(admin.id, message, type);
      savedNotifications.push(notif);
    }

    // 🔹 2. Envoi temps réel dans la room "admins"
    this.server.to('admins').emit('admin_notification', {
      message,
      type,
      isRead: false,
      createdAt: new Date(),
    });

    console.log("Notifications enregistrées et envoyées aux admins");
    return savedNotifications;
  } catch (error) {
    console.error("Erreur lors de l'envoi aux admins:", error);
    throw error;
  }
}


}