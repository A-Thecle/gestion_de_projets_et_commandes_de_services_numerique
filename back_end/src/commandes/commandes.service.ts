import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { Utilisateur } from 'src/utilisateurs/entities/utilisateur.entity';
import { ServicesEntity } from 'src/services-entity/entities/services-entity.entity';
import { Commande, StatutCommande } from './entities/commande.entity';
import { ProjetsService } from 'src/projets/projets.service';
import { NotificationGateway } from 'src/notifications/notification.gateway';

@Injectable()
export class CommandesService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepo: Repository<Commande>,
    @InjectRepository(Utilisateur)
    private readonly userRepo: Repository<Utilisateur>,
    @InjectRepository(ServicesEntity)
    private readonly serviceRepo: Repository<ServicesEntity>,
    private readonly projetsService: ProjetsService,
    private readonly notificationGateway: NotificationGateway,
    
  ) {}

  async createCommande(createCommandeDto: CreateCommandeDto): Promise<Commande> {
    const { client_id, service_id, ...data } = createCommandeDto;

    const client = await this.userRepo.findOne({ where: { id: client_id } });
    if (!client) throw new NotFoundException(`Client #${client_id} non trouvé`);

    const service = await this.serviceRepo.findOne({ where: { service_id } });
    if (!service) throw new NotFoundException(`Service #${service_id} non trouvé`);

    const commande = this.commandeRepo.create({
      ...data,
      client,
      service,
      fichier_joint: data.fichier_joint,
    });

    const savedCommande = await this.commandeRepo.save(commande);
     // Notification à l'admin pour nouvelle commande
    const adminMessage = `Nouvelle commande #${savedCommande.commandes_id} créée par ${client.prenom} ${client.nom}.`;
    await this.notificationGateway.sendNotificationToAdmins(adminMessage, 'NEW_ORDER');

    return savedCommande;
  }

  async validerCommande(id: string): Promise<Commande> {
    const commande = await this.findOneCommande(id);

    if (!commande) throw new NotFoundException(`Commande #${id} non trouvée`);

    // Mise à jour du statut (logique originale restaurée)
    commande.statut_commande = StatutCommande.ACCEPTEE;
    await this.commandeRepo.save(commande);

    // Envoyer une notification pour la validation
    const messageValidation = `Votre demande de commande ${id} a été acceptée.`;
    await this.notificationGateway.sendNotification(commande.client.id, messageValidation, 'ORDER_VALIDATED');

    // Crée le projet automatiquement (logique originale restaurée)
    try {
      const projet = await this.projetsService.createProjetFromCommande(id);
      console.log('Projet créé automatiquement :', projet.projet_id);
    } catch (error: any) {
      console.error('Erreur création projet:', error.message);
    }

    return commande;
  }

  async refuserCommande(id: string): Promise<Commande> {
    const commande = await this.findOneCommande(id);

    if (!commande) throw new NotFoundException(`Commande #${id} non trouvée`);

    // Mise à jour du statut (logique originale restaurée)
    commande.statut_commande = StatutCommande.REFUSEE;
    await this.commandeRepo.save(commande);

    // Envoyer une notification pour le refus
    const messageRefus = `Votre demande de commande ${id} a été refusée.`;
    await this.notificationGateway.sendNotification(commande.client.id, messageRefus, 'ORDER_REFUSED');

    return commande;
  }

  async findAllCommande(): Promise<Commande[]> {
    return this.commandeRepo.find({
      relations: ['client', 'service'],
    });
  }

  async findOneCommande(id: string): Promise<Commande> {
    const commande = await this.commandeRepo.findOne({
      where: { commandes_id: id },
      relations: ['client', 'service'],
    });

    if (!commande) {
      throw new NotFoundException(`Commande #${id} non trouvée`);
    }

    return commande;
  }

  async updateCommande(id: string, updateCommandeDto: UpdateCommandeDto): Promise<Commande> {
    const commande = await this.findOneCommande(id);
    Object.assign(commande, updateCommandeDto);
    return this.commandeRepo.save(commande);
  }

  async removeCommande(id: string): Promise<void> {
    const commande = await this.findOneCommande(id);
    await this.commandeRepo.remove(commande);
  }

async searchCommandes(term: string): Promise<Commande[]> {
  if (!term || !term.trim()) {
    return this.findAllCommande();
  }

  const likeTerm = `%${term.toLowerCase()}%`;

  return this.commandeRepo
    .createQueryBuilder('c')
    .leftJoinAndSelect('c.client', 'client')
    .leftJoinAndSelect('c.service', 'service')
    .where('LOWER(c.commandes_id) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(c.description_besoins) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(c.statut_commande) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(client.nom) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(client.prenom) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(service.nom_service) LIKE :term', { term: likeTerm })
    // Recherche sur date_commande au format J/M/A
    .orWhere("DATE_FORMAT(c.date_commande, '%d/%m/%Y') LIKE :term", { term: likeTerm })
     .orWhere("DATE_FORMAT(c.date_livraison, '%d/%m/%Y') LIKE :term", { term: likeTerm })
    .orderBy('c.date_commande', 'DESC')
    .getMany();
}


  async findCommandesByClient(clientId: Number): Promise<Commande[]> {
    const commandes = await this.commandeRepo.find({
      where: { client: { id: Number(clientId) } },
      relations: ['client', 'service'],
      order: { date_commande: 'DESC' },
    });

    if (!commandes || commandes.length === 0) {
      throw new NotFoundException(`Aucune commande trouvée pour le client #${clientId}`);
    }

    return commandes;
  }

  async countCommandesEnAttente(): Promise<number> {
  return this.commandeRepo.count({
    where: { statut_commande: StatutCommande.EN_ATTENTE },
  });
}
}