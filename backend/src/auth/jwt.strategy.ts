// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'bpt@uigm',
    });
  }

  async validate(payload: any) {
    // Validasi tambahan bisa dilakukan di sini
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
