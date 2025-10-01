import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // 🔹 à importer
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';
import { NotificationGateway } from './notification.gateway';
import { Notification } from './entities/notification.entity';
import { Utilisateur } from 'src/utilisateurs/entities/utilisateur.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Utilisateur]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'aa_bb_cc', // 🔹 ajoute ton secret JWT
      signOptions: { expiresIn: '1d' }, 
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationsModule {}
