// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'aa_bb_cc', // ⚠️ doit être identique à ta clé utilisée dans JwtModule
    });
  }

  async validate(payload: any) {
    // Ici on garde la même structure que le token signé
    return { id: payload.id, email: payload.email, role: payload.role };
  }
}
