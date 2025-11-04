// backend\src\auth\local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    console.log('🔐 LocalStrategy validating:', username);

    const user = await this.authService.validateUser(username, password);

    if (!user) {
      console.log('❌ LocalStrategy: Validation failed');
      throw new UnauthorizedException();
    }

    console.log('✅ LocalStrategy: Validation successful. User:', {
      id: user.id_user,
      username: user.username,
      role: user.role,
      nama_lengkap: user.nama_lengkap,
    });

    return user;
  }
}
