import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Utilisateur } from 'src/utilisateurs/entities/utilisateur.entity';
import { Projet } from 'src/projets/entities/projet.entity';
import { JwtModule } from '@nestjs/jwt';
import { MessagesGateway } from './messages.gateway';

@Module({
 imports: [TypeOrmModule.forFeature([Message, Utilisateur, Projet]), JwtModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports : [MessagesService]
})
export class MessagesModule {}
