import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Utilisateur } from '../utilisateurs/entities/utilisateur.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Utilisateur)
    private utilisateurRepo: Repository<Utilisateur>,
    private jwtService: JwtService,
  ) {}

  async login(emailOrPhone: string, mot_de_passe: string) {
    let utilisateur: Utilisateur | null = null;

    const cleanedInput = emailOrPhone.replace(/[\s-+]/g, '');

    if (cleanedInput.includes('@')) {
      utilisateur = await this.utilisateurRepo.findOne({
        where: { email: cleanedInput.toLowerCase() },
      });
    } else {
     const phoneNumber = cleanedInput; // garder en string
utilisateur = await this.utilisateurRepo.findOne({
  where: { telephone: phoneNumber },
});

    }

  if (!utilisateur) {
  console.error('❌ Email ou téléphone non trouvé :', emailOrPhone);
  throw new UnauthorizedException('EMAIL_OR_PHONE_NOT_FOUND');
}

const passwordValid = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

if (!passwordValid) {
  console.error('❌ Mot de passe incorrect pour :', emailOrPhone);
  throw new UnauthorizedException('INVALID_PASSWORD');
}


    const payload = { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role };
    console.log('✅ Génération du token avec payload:', payload);

    return {
      access_token: this.jwtService.sign(payload),
      utilisateur: {
        id: utilisateur.id,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    };
  }
}
