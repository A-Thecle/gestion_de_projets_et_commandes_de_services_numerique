import { DataSource } from 'typeorm';
import { Utilisateur } from '../utilisateurs/entities/utilisateur.entity.js';
import * as bcrypt from 'bcrypt';

export class CreateAdminSeed {
  async run(dataSource: DataSource): Promise<void> {
    const utilisateurRepository = dataSource.getRepository(Utilisateur);

    // Vérifier si un admin existe déjà
    const existingAdmin = await utilisateurRepository.findOne({ where: { email: 'admin@gmail.com' } });
    if (existingAdmin) {
      console.log('Un administrateur existe déjà.');
      return;
    }

    // Créer l'admin
    const admin = utilisateurRepository.create({
      code_utilisateur: 'AD-001',
      nom: 'Administrateur',
      prenom: 'admin',
      email: 'admin@gmail.com',
      mot_de_passe: await bcrypt.hash('admin123', 10),
      telephone: '+261 34 50 756 09',
      role: 'admin',
    });

    await utilisateurRepository.save(admin);
    console.log('Administrateur créé avec succès.');
  }
}