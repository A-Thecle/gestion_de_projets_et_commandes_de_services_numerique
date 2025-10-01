import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temoignage } from './entities/temoignage.entity';
import { CreateTemoignageDto } from './dto/create-temoignage.dto';
import { Utilisateur } from 'src/utilisateurs/entities/utilisateur.entity';
import { Projet } from 'src/projets/entities/projet.entity';
import { NotificationService } from 'src/notifications/notifications.service';
import { NotificationGateway } from 'src/notifications/notification.gateway';

@Injectable()
export class TemoignagesService {
  constructor(
    @InjectRepository(Temoignage)
    private temoignageRepo: Repository<Temoignage>,
    @InjectRepository(Utilisateur)
    private userRepo: Repository<Utilisateur>,
    @InjectRepository(Projet)
    private projetRepo: Repository<Projet>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async findAll(): Promise<Temoignage[]> {
    return await this.temoignageRepo.find({
      relations: ["client", "projet"],
      order: { date_soumission: "DESC" }
    });
  }

  async create(dto: CreateTemoignageDto): Promise<Temoignage> {
    const user = await this.userRepo.findOne({ where: { id: dto.id_client } });
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    const projet = await this.projetRepo.findOne({ where: { projet_id: dto.id_projet } });
    if (!projet) throw new NotFoundException("Projet non trouvé");

    const temoignage = this.temoignageRepo.create({
      client: user,
      projet: projet,
      note: dto.note,
      commentaire: dto.commentaire,
    });

    const savedTemoignage = await this.temoignageRepo.save(temoignage);

    // Notification à l'admin pour nouveau témoignage
    const adminMessage = `Nouveau témoignage soumis par ${user.prenom} ${user.nom} pour le projet ${projet.titre_projet}.`;
    await this.notificationGateway.sendNotificationToAdmins(adminMessage, 'NEW_TESTIMONY');

    return savedTemoignage;
  }

  async findByProjet(projetId: string): Promise<Temoignage[]> {
    return this.temoignageRepo.find({
      where: { projet: { projet_id: projetId } },
      relations: ["client"],
      order: { date_soumission: "DESC" },
    });
  }

  async updateStatus(id: number, statut: 'publié' | 'refusé'): Promise<Temoignage> {
    const temoignage = await this.temoignageRepo.findOne({ where: { id_temoignage: id }, relations: ['client', 'projet'] });
    if (!temoignage) throw new NotFoundException("Témoignage introuvable");

    temoignage.statut_temoignage = statut;
    const updatedTemoignage = await this.temoignageRepo.save(temoignage);

    if (statut === 'publié' && temoignage.client) {
  const clientId = temoignage.client.id;
  const projetTitre = temoignage.projet?.titre_projet || 'Projet inconnu';
  const message = `Votre témoignage a été publié avec succès pour le projet "${projetTitre}".`;

  try {
    // ✅ UNE SEULE insertion + envoi temps réel
    await this.notificationGateway.sendNotification(clientId, message, 'TESTIMONY_PUBLISHED');
    console.log('Notification créée et envoyée');
  } catch (error) {
    console.error('Erreur lors de la notification:', error);
  }
}


    return updatedTemoignage;
  }

  async findPublished(): Promise<Temoignage[]> {
    return this.temoignageRepo.find({
      where: { statut_temoignage: 'publié' },
      relations: ['client', 'projet'],
      order: { date_soumission: 'DESC' },
    });
  }
async searchTemoignages(term: string): Promise<Temoignage[]> {
  if (!term || !term.trim()) {
    return this.findAll();
  }

  const likeTerm = `%${term.toLowerCase()}%`;

  return this.temoignageRepo
    .createQueryBuilder('t')
    .leftJoinAndSelect('t.client', 'client')
    .leftJoinAndSelect('t.projet', 'projet')
    .leftJoinAndSelect('projet.commande', 'commande')
    .leftJoinAndSelect('commande.service', 'service')
    .where('CAST(t.id_temoignage AS CHAR) LIKE :term', { term: likeTerm })
    .orWhere('CAST(t.note AS CHAR) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(t.commentaire) LIKE :term', { term: likeTerm })
    // Recherche sur date_soumission au format J/M/A
    .orWhere("DATE_FORMAT(t.date_soumission, '%d/%m/%Y') LIKE :term", { term: likeTerm })
    .orWhere('LOWER(t.statut_temoignage) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(commande.description_besoins) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(client.nom) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(client.prenom) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(service.nom_service) LIKE :term', { term: likeTerm })
    .orderBy('t.date_soumission', 'DESC')
    .getMany();
}



}