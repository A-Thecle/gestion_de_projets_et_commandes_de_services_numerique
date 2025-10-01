import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { MessagesService } from './messages.service';
import { CreerMessageDto } from './dto/create-message.dto';
import { WsException } from '@nestjs/websockets'; // Ajout de l'import manquant

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private messagesService: MessagesService) {}

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('envoyerMessage')
  async gererEnvoiMessage(client: Socket, dto: CreerMessageDto) {
    const userId = client.data.user?.id;
    console.log('Envoi message WebSocket, userId:', userId, 'DTO:', dto); // Log pour débogage
    if (!userId) {
      console.error('Aucun userId fourni dans envoyerMessage');
      throw new WsException('Utilisateur non authentifié');
    }
    const message = await this.messagesService.envoyerMessage(userId, dto);
    this.server.to(`projet_${dto.id_projet}`).emit('nouveauMessage', message);
    this.server.to(`utilisateur_${message.destinataire.id}`).emit('miseAJourNonLus');
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('rejoindreChatProjet')
  gererRejoindreProjet(client: Socket, idProjet: string) {
    console.log(`Client ${client.id} rejoint le salon projet_${idProjet}`); // Log pour débogage
    client.join(`projet_${idProjet}`);
  }
}