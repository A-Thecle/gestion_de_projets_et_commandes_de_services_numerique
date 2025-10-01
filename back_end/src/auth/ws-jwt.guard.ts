// src/auth/ws-jwt.guard.ts
import { Injectable, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: any): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth?.token;
    console.log('Token WebSocket reçu:', token);

    if (!token) {
      console.error('Token manquant dans la connexion WebSocket');
      throw new WsException('Token manquant');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      console.log('Payload WebSocket décodé:', payload);
      // stocke le payload dans client.data pour l'utiliser côté gateway
      client.data.user = payload;
      return true;
    } catch (error: any) {
      console.error('Erreur de vérification du token WebSocket:', error.message || error);
      throw new WsException('Token invalide');
    }
  }
}
