import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreerMessageDto } from './dto/create-message.dto';
import { Utilisateur } from '../utilisateurs/entities/utilisateur.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Server } from 'socket.io';
import * as fs from 'fs';
import { join } from 'path';


@Injectable()
export class MessagesService {
    private io!: Server;
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(Utilisateur)
    private utilisateurRepo: Repository<Utilisateur>,
    @InjectRepository(Projet)
    private projetRepo: Repository<Projet>,
  ) {}


async envoyerMessage(
  idExpediteur: number,
  dto: CreerMessageDto,
  fichier?: Express.Multer.File 
): Promise<Message> {
  const expId = Number(idExpediteur);
  const destId = Number(dto.id_destinataire);
  const projetId = dto.id_projet;

  const expediteur = await this.utilisateurRepo.findOneBy({ id: expId });
  const destinataire = await this.utilisateurRepo.findOneBy({ id: destId });
  const projet = await this.projetRepo.findOneBy({ projet_id: projetId });

  if (!expediteur || !destinataire || !projet) 
    throw new NotFoundException('Utilisateur ou projet non trouvé');

  const message = this.messageRepo.create({
    contenu: dto.contenu || '', // si vide, mettre ''
    expediteur,
    destinataire,
    projet,
    est_lu: false,
  });
if (fichier) {
  message.fichier = `uploads/${fichier.filename}`; // Chemin du fichier
  message.typeFichier = fichier.mimetype; // Type MIME
  message.nomOriginalFichier = fichier.originalname; // Nom original du fichier
}

  const savedMessage = await this.messageRepo.save(message);

  // ⚡ Notification WebSocket
  if (this.io) {
    this.io.to(`user_${destId}`).emit('nouveauMessage', savedMessage);

    const count = await this.obtenirNombreNonLus(destId);
    this.io.to(`user_${destId}`).emit('miseAJourNonLus', count);
    console.log(`Événement miseAJourNonLus émis pour user_${destId} avec count=${count}`);
  } else {
    console.error('Socket.io non initialisé');
  }

  return savedMessage;
}



setSocketServer(io: Server) {
  this.io = io;
  // Chaque utilisateur rejoindra sa "room" individuelle pour recevoir notifications
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) socket.join(`user_${userId}`);
  });
}




  async obtenirMessagesPourProjet(idProjet: string, idUtilisateur: number): Promise<Message[]> {
    console.log('Récupération messages pour projet:', idProjet, 'par utilisateur:', idUtilisateur); // Log pour débogage
    return this.messageRepo.find({
      where: { projet: { projet_id: idProjet } },
      relations: ['expediteur', 'destinataire'],
      order: { date_creation: 'ASC' },
    });
  }

  async marquerCommeLu(idMessage: string): Promise<void> {
    console.log('Marquer comme lu, message ID:', idMessage); // Log pour débogage
    await this.messageRepo.update({ id_message: idMessage }, { est_lu: true });
  }

async obtenirNombreNonLus(idUtilisateur: number): Promise<number> {
  const count = await this.messageRepo.count({
    where: { destinataire: { id: idUtilisateur }, est_lu: false },
  });
  console.log(`Nombre de messages non lus pour utilisateur ${idUtilisateur}: ${count}`);
  // Log des messages non lus pour débogage
  const messagesNonLus = await this.messageRepo.find({
    where: { destinataire: { id: idUtilisateur }, est_lu: false },
    relations: ['projet'],
  });
  console.log('Messages non lus:', JSON.stringify(messagesNonLus, null, 2));
  return count;
}

 async marquerTousCommeLu(idProjet: string, idUtilisateur: number): Promise<void> {
  await this.messageRepo
    .createQueryBuilder()
    .update(Message)
    .set({ est_lu: true })
    .where("projet_id = :idProjet AND destinataire_id = :idUtilisateur AND est_lu = false", {
      idProjet,
      idUtilisateur
    })
    .execute();
}

async obtenirNombreNonLusParProjet(userId: number): Promise<{ [projetId: string]: number }> {
  const results = await this.messageRepo
    .createQueryBuilder('message')
    .select('message.projet_id', 'projetId')
    

    .addSelect('COUNT(*)', 'nonLus')
    .where('message.destinataire_id = :userId', { userId })
    .andWhere('message.est_lu = false')
    .groupBy('message.projet_id')
   
    .getRawMany();

  // Transformer en dictionnaire { projetId: nombre }
  const map: { [projetId: string]: number } = {};
  results.forEach(r => {
    map[r.projetId] = Number(r.nonLus);
  });
  return map;
}





}