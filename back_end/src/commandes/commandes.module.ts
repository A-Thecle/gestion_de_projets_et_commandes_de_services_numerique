import { Module } from '@nestjs/common';
import { CommandesService } from './commandes.service';
import { CommandesController } from './commandes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from './entities/commande.entity';


import { Utilisateur } from 'src/utilisateurs/entities/utilisateur.entity';
import { ServicesEntity } from 'src/services-entity/entities/services-entity.entity';
import { ProjetsModule } from 'src/projets/projets.module';
import { NotificationsModule } from 'src/notifications/notifications.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Commande, Utilisateur, ServicesEntity]), 
    ProjetsModule,
    NotificationsModule

    
  ],
  controllers: [CommandesController],
  providers: [CommandesService],
   exports: [CommandesService],
})
export class CommandesModule {}
