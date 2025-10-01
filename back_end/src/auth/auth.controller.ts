// src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() credentials: { emailOrPhone: string; mot_de_passe: string }) {
    try {
      const result = await this.authService.login(credentials.emailOrPhone, credentials.mot_de_passe);
      console.log('Réponse envoyée par /utilisateurs/login:', result); // Log pour déboguer
      return result;
    } catch (err: any) { // Remplacement de 'error' par 'err' avec typage 'any'
      throw new UnauthorizedException(`Erreur lors de la connexion: ${err.message || 'Identifiants invalides'}`);
    }
  }
}