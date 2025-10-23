// src/auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Memberitahu Passport untuk menggunakan field 'username' dari body request
    super({ usernameField: 'username' });
  }

  /**
   * Metode ini akan dijalankan secara otomatis oleh Passport
   * saat endpoint dengan @UseGuards(LocalAuthGuard) dipanggil.
   */
  async validate(username: string, password: string): Promise<any> {
    // Memanggil metode validateUser dari AuthService untuk mengecek username dan password
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      // Jika user tidak ditemukan atau password salah, lempar error
      throw new UnauthorizedException('Kredensial login tidak valid');
    }
    // Jika berhasil, kembalikan data user (tanpa password)
    return user;
  }
}
