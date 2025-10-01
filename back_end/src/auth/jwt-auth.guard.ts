import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    console.log('En-tête Authorization:', authHeader); // Log pour débogage

    if (!authHeader) {
      console.error('Aucun en-tête Authorization fourni');
      throw new UnauthorizedException('Token manquant');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      console.error('Format du token invalide:', authHeader);
      throw new UnauthorizedException('Format du token invalide');
    }

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });

      console.log('Payload JWT décodé:', payload); // Log pour débogage
      request.user = payload; // Ajoute le payload à la requête
      return true;
    } catch (err: any) {
      console.error('Erreur de vérification du token:', err.message || err);
      throw new UnauthorizedException('Token invalide');
    }
  }
}