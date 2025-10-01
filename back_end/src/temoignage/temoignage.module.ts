import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemoignagesService } from './temoignage.service';
import { TemoignagesController } from './temoignage.controller';
import { Temoignage } from './entities/temoignage.entity';
import { Utilisateur } from 'src/utilisateurs/entities/utilisateur.entity';
import { Projet } from 'src/projets/entities/projet.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Temoignage, Utilisateur, Projet]), NotificationsModule],
  controllers: [TemoignagesController],
  providers: [TemoignagesService],

})
export class TemoignageModule {}
