// backend\src\auth\auth.controller.ts
import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler'; // 1. Import Throttle
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 2. Tambahkan aturan yang lebih ketat KHUSUS untuk endpoint login
  // Aturan ini akan menimpa (override) aturan global yang ada di app.module.ts
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // Hanya 5 percobaan dalam 1 menit
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // 3. (Opsional) Contoh cara melewati (skip) rate limit untuk endpoint tertentu
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
