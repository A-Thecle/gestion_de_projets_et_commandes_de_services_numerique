import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Utilisateur } from './entities/utilisateur.entity';
import * as bcrypt from 'bcrypt';
import { ILike } from 'typeorm'; // Import ILike pour recherche insensible à la casse (si PostgreSQL)
import { NotificationGateway } from 'src/notifications/notification.gateway';

@Injectable()
export class UtilisateursService {
  constructor(
    @InjectRepository(Utilisateur)
    private userRepo: Repository<Utilisateur>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async validateUser(emailOrPhone: string, pass: string): Promise<any> {
    const user = await this.findByEmailOrPhone(emailOrPhone);
    console.log('Utilisateur trouvé:', user); // Log pour débogage

    if (user) {
      const isPasswordValid = await bcrypt.compare(pass, user.mot_de_passe);
      console.log('Mot de passe valide:', isPasswordValid); // Log pour débogage
      if (isPasswordValid) {
        const { mot_de_passe, ...result } = user;
        return result;
      }
    }

    return null; // utilisateur non valide
  }

  async findByEmailOrPhone(emailOrPhone: string) {
    let user;

    
   const cleanedInput = emailOrPhone.replace(/\s+/g, ''); 


   
    if (/^\+?\d+$/.test(cleanedInput)) {
      
     user = await this.userRepo.findOneBy({ telephone: cleanedInput });

    } else {
      // Recherche par email (insensible à la casse)
      user = await this.userRepo.findOneBy({ email: ILike(emailOrPhone.toLowerCase()) }); // Utiliser ILike pour insensible à la casse
    }

    return user;
  }

async createUser(dto: CreateUtilisateurDto) {
  const utilisateur = new Utilisateur();
  utilisateur.nom = dto.nom;
  utilisateur.prenom = dto.prenom;
  utilisateur.email = dto.email.toLowerCase();
  utilisateur.telephone = dto.telephone;
  utilisateur.role = dto.role || 'client';
  utilisateur.mot_de_passe = await bcrypt.hash(dto.mot_de_passe, 10);

  const prefix = utilisateur.role === 'admin' ? 'AD' : 'CL';
  const dernier = await this.userRepo.findOne({
    where: { role: utilisateur.role },
    order: { id: 'DESC' },
  });

  let numero = 1;
  if (dernier && dernier.code_utilisateur) {
    const dernierNum = parseInt(dernier.code_utilisateur.split('-')[1], 10);
    numero = dernierNum + 1;
  }

  utilisateur.code_utilisateur = `${prefix}-${String(numero).padStart(3, '0')}`;

  const savedUser = await this.userRepo.save(utilisateur);

  // ✅ Envoi notification aux admins
  if (utilisateur.role === 'client') {
    const message = `Nouveau client inscrit: ${utilisateur.prenom} ${utilisateur.nom} (${utilisateur.email})`;
    // Il faut injecter NotificationGateway dans le service ou utiliser un EventEmitter
    if (this.notificationGateway) {
      await this.notificationGateway.sendNotificationToAdmins(message, 'NEW_CLIENT');
    }
  }

  return savedUser;
}


  async getAllUser(): Promise<Utilisateur[]> {
    return await this.userRepo.find({
      where: { role: 'client' }
    }) || []; // Garantir [] si null
  }

  async findOneUser(id: number): Promise<Utilisateur | null> {
    return await this.userRepo.findOne({ where: { id } });
  }

  async removeUser(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }

  async findUser(search: { code_utilisateur?: string; prenom?: string }): Promise<Utilisateur[]> {
    const query = this.userRepo.createQueryBuilder('user');

    if (search.code_utilisateur) {
      query.andWhere('user.code_utilisateur = :code', { code: search.code_utilisateur });
    }

    if (search.prenom) {
      query.andWhere('user.prenom ILIKE :prenom', { prenom: `%${search.prenom}%` }); // Utiliser ILike pour insensible à la casse
    }

    return await query.getMany() || [];
  }

  async getClientFiche(code_utilisateur: string): Promise<Utilisateur | null> {
    return await this.userRepo.findOne({
      where: { code_utilisateur },
      relations: [
        'commandes',
        'commandes.projets', 
        'commandes.service'  
      ]
    });
  }

  async updateClient(id: number, updateUtilisateurDto: UpdateUtilisateurDto) {
  const user = await this.userRepo.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`Utilisateur avec id ${id} introuvable`);
  }

  if (updateUtilisateurDto.email) {
    updateUtilisateurDto.email = updateUtilisateurDto.email.toLowerCase();
  }
  // updateClient
if (updateUtilisateurDto.telephone) {
    updateUtilisateurDto.telephone = updateUtilisateurDto.telephone.replace(/\s+/g, '');
}
  Object.assign(user, updateUtilisateurDto);

  if (updateUtilisateurDto.mot_de_passe) {
    user.mot_de_passe = await bcrypt.hash(updateUtilisateurDto.mot_de_passe, 10);
  }

  return await this.userRepo.save(user);
}

async searchClients(term: string): Promise<Utilisateur[]> {
    console.log('Terme reçu:', term);

    // Si le terme est vide, on renvoie tous les clients
    if (!term || !term.trim()) {
        return this.userRepo.find({ where: { role: 'client' } });
    }

    const likeTerm = `%${term.toLowerCase()}%`;

    const results = await this.userRepo
        .createQueryBuilder('client')
        .where('client.role = :role', { role: 'client' })
        .andWhere(
            `LOWER(client.nom) LIKE :term
            OR LOWER(client.prenom) LIKE :term
            OR LOWER(client.code_utilisateur) LIKE :term
            OR LOWER(client.email) LIKE :term
            OR CAST(client.telephone AS CHAR) LIKE :term`,
            { term: likeTerm }
        )
        .orderBy('client.nom', 'ASC')
        .getMany();

    console.log('Résultats de recherche:', results);
    return results;
}


}