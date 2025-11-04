// backend/src/auth/local-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Username atau password salah');
    }

    // Pastikan user object memiliki semua field yang diperlukan
    if (!user.id_user) {
      throw new UnauthorizedException('Data user tidak lengkap');
    }

    return user;
  }
}
