import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Projet, EtatProjet } from './entities/projet.entity';
import { Commande } from 'src/commandes/entities/commande.entity';
import { NotificationService } from 'src/notifications/notifications.service';
import { NotificationGateway } from 'src/notifications/notification.gateway';

@Injectable()
export class ProjetsService {
  constructor(
    @InjectRepository(Projet)
    private readonly projetRepo: Repository<Projet>,
    @InjectRepository(Commande)
    private readonly commandeRepo: Repository<Commande>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createProjetFromCommande(commande_id: string): Promise<Projet> {
    const commande = await this.commandeRepo.findOne({
      where: { commandes_id: commande_id },
      relations: ['client', 'service'],
    });

    if (!commande) throw new NotFoundException(`Commande #${commande_id} non trouvée`);

    if (commande.statut_commande !== 'acceptee') {
      throw new Error(`La commande #${commande_id} n'est pas validée. Impossible de créer le projet.`);
    }

    const projet = this.projetRepo.create({
      commande,
      titre_projet: `Projet pour ${commande.service?.nom_service || 'N/A'}`,
      description_projet: commande.description_besoins || '',
      etat: EtatProjet.EN_ATTENTE,
      date_livraison_prevue: commande.date_livraison || new Date(),
      documents_partages: commande.fichier_joint,

    });

    const savedProjet = await this.projetRepo.save(projet);

     // Notification à l'admin pour nouveau projet
    const adminMessage = `Nouveau projet #${savedProjet.projet_id} créé à partir de la commande ${commande_id}.`;
    await this.notificationGateway.sendNotificationToAdmins(adminMessage, 'NEW_PROJECT');

    // Envoyer une notification pour la création du projet (logique originale restaurée)
    const message = `Un projet "${savedProjet.titre_projet}" a été créé pour votre commande ${commande_id}.`;
    await this.notificationGateway.sendNotification(commande.client.id, message, 'PROJECT_CREATED');

    return savedProjet;
  }

  async findAllProject(): Promise<Projet[]> {
    return this.projetRepo.find({ relations: ['commande', 'commande.client', 'commande.service'] });
  }

  async findOneProject(id: string): Promise<Projet> {
    const projet = await this.projetRepo.findOne({
      where: { projet_id: id },
      relations: ['commande', 'commande.client', 'commande.service'],
    });
    if (!projet) throw new NotFoundException(`Projet #${id} non trouvé`);
    return projet;
  }

 async updateProject(id: string, updateProjetDto: Partial<Projet>): Promise<Projet> {
  if (updateProjetDto.etat) {
    // si le champ "etat" est fourni → utiliser la logique avec notification
    return this.updateProjetStatus(id, updateProjetDto.etat as EtatProjet);
  }

  // sinon, mise à jour classique sans notification
  const projet = await this.findOneProject(id);
  Object.assign(projet, updateProjetDto);
  return this.projetRepo.save(projet);
}

 async removeProject(id: string): Promise<void> {
  const projet = await this.findOneProject(id);

  // 1️⃣ Supprimer tous les messages liés au projet
  await this.projetRepo.manager
    .createQueryBuilder()
    .delete()
    .from('messages') // nom exact de la table Messages dans ta DB
    .where('projet_id = :projetId', { projetId: id })
    .execute();

  // 2️⃣ Supprimer le projet
  await this.projetRepo.remove(projet);
}


  async findProjetsByClient(clientId: Number): Promise<Projet[]> {
    const projets = await this.projetRepo.find({
      where: { commande: { client: { id: Number(clientId) } } },
      relations: ['commande', 'commande.client', 'commande.service'],
      order: { date_creation: 'DESC' },
    });

    if (!projets || projets.length === 0) {
      throw new NotFoundException(`Aucun projet trouvé pour le client #${clientId}`);
    }

    return projets;
  }
async updateProjetStatus(projetId: string, etat: EtatProjet): Promise<Projet> {
  await this.projetRepo.update({ projet_id: projetId }, { etat });
  const projet = await this.findOneProject(projetId);

  if (!projet.commande?.client) {
    throw new NotFoundException('Client introuvable pour ce projet');
  }

  const clientId = projet.commande.client.id;
  const message = `L'état de votre projet "${projet.titre_projet}" est maintenant "${etat}".`;

  try {
    // ✅ UNE SEULE insertion + envoi temps réel
    await this.notificationGateway.sendNotification(clientId, message, 'PROJECT_UPDATED');
    console.log('Notification créée et envoyée');
  } catch (error) {
    console.error('Erreur lors de la notification:', error);
  }

  return projet;
}

async searchProjets(term: string): Promise<Projet[]> {
  if (!term || !term.trim()) {
    return this.findAllProject();
  }

  const likeTerm = `%${term.toLowerCase()}%`;

  return this.projetRepo
    .createQueryBuilder('p')
    .leftJoinAndSelect('p.commande', 'commande')
    .leftJoinAndSelect('commande.client', 'client')
    .leftJoinAndSelect('commande.service', 'service')
    .where('LOWER(p.projet_id) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(p.titre_projet) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(p.description_projet) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(p.etat) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(commande.description_besoins) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(client.nom) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(client.prenom) LIKE :term', { term: likeTerm })
    .orWhere('LOWER(service.nom_service) LIKE :term', { term: likeTerm })
    // ✅ compatible MySQL → conversion en chaîne
    .orWhere('CAST(commande.commandes_id AS CHAR) LIKE :term', { term: likeTerm })
    .orderBy('p.date_creation', 'DESC')
    .getMany();
}


// Projets en cours
async countProjetsEnCours(): Promise<number> {
  return this.projetRepo.count({
    where: [
      { etat: EtatProjet.EN_COURS },
      { etat: EtatProjet.EN_REVISION },
    ],
  });
}

// Projets terminés
async countProjetsTermines(): Promise<number> {
  return this.projetRepo.count({
    where: { etat: EtatProjet.TERMINE },
  });
}



  }








