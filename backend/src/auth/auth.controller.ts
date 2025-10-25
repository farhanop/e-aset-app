// backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Patch,
  Body,
  ValidationPipe,
  Inject,
  UnauthorizedException,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import {
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request as NestRequest,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs/promises';
import { UsersService } from '../users/users.service';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SlidingThrottlerGuard } from '../common/guards/sliding-throttler.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    @Inject(SlidingThrottlerGuard)
    private slidingThrottlerGuard: SlidingThrottlerGuard,
  ) {}

  // Aturan yang lebih ketat KHUSUS untuk endpoint login
  // Aturan ini akan menimpa (override) aturan global yang ada di app.module.ts
  @Throttle({ default: { limit: 50, ttl: 1800 } }) // 50 requests per 30 minutes
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // Melewati (skip) rate limit untuk endpoint profile
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    console.log('Profile endpoint called with user:', req.user);

    // Perbaikan: Coba semua kemungkinan lokasi ID user
    const userId = req.user.sub || req.user.id_user || req.user.userId;

    if (!userId) {
      console.error('User object does not contain ID:', req.user);
      throw new UnauthorizedException('Token tidak memiliki ID pengguna.');
    }

    console.log('Extracted userId:', userId);

    // ✅ Ambil data user dari database
    const user = await this.usersService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    // ✅ Tambahkan informasi session ke response
    const sessionInfo = this.slidingThrottlerGuard.getUserSessionInfo(userId);

    // ✅ Kembalikan user data tanpa password
    const result = {
      ...user,
      sessionInfo,
    };

    console.log('Profile data to be sent:', result);

    return result;
  }

  // Endpoint untuk update profil
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body(new ValidationPipe()) updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.sub; // Ambil ID user dari JWT (sub)
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  // Endpoint untuk mengupload foto profil (disimpan di ./uploads/profile-photos)
  @UseGuards(JwtAuthGuard)
  @Post('profile/upload-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-photos',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadProfilePhoto(
    @NestRequest() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const newPath = `/uploads/profile-photos/${file.filename}`;

    // If user exists in request (JwtAuthGuard), try to delete previous photo and persist new path
    try {
      const userId = req.user?.sub;
      if (userId) {
        const existing = await this.usersService.findOneById(userId);
        if (existing && existing.foto_profil) {
          // Delete only if it's an uploads path under profile-photos
          const fp = existing.foto_profil;
          if (fp && fp.startsWith('/uploads/profile-photos/')) {
            const absoluteOld = join(process.cwd(), fp);
            try {
              await fs.unlink(absoluteOld);
            } catch (err) {
              // ignore unlink errors (file may not exist)
              console.warn(
                'Could not delete old profile photo:',
                absoluteOld,
                err.message || err,
              );
            }
          }

          // Persist new foto_profil on user
          const updated = await this.usersService.update(userId, {
            foto_profil: newPath,
          } as any);
          return {
            message: 'Profile photo uploaded and profile updated',
            url: newPath,
            filename: file.filename,
            user: updated,
          };
        }
      }
    } catch (err) {
      console.warn('Error while handling previous profile photo cleanup:', err);
    }

    // Fallback: return the path, client may PATCH profile later
    return {
      message: 'Profile photo uploaded successfully',
      url: newPath,
      filename: file.filename,
    };
  }

  // Endpoint untuk ganti password
  @UseGuards(JwtAuthGuard)
  @Post('profile/change-password')
  async changePassword(
    @Request() req,
    @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.sub; // Ambil ID user dari JWT (sub)
    return this.authService.changePassword(userId, changePasswordDto);
  }

  // Endpoint untuk logout manual
  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  async logoutOtherSessions(@Request() req) {
    const userId = req.user.sub;
    const currentToken = req.headers.authorization?.replace('Bearer ', '');

    // Hapus semua session kecuali yang saat ini
    const result = await this.slidingThrottlerGuard.clearUserSessions(
      userId,
      currentToken,
    );

    return {
      message: result
        ? 'Semua session lain berhasil dihapus'
        : 'Tidak ada session lain yang aktif',
      success: result,
    };
  }

  // Endpoint untuk mendapatkan status session
  @UseGuards(JwtAuthGuard)
  @Get('session-status')
  getSessionStatus(@Request() req) {
    const userId = req.user.sub;
    const status = this.slidingThrottlerGuard.getUserActivityStatus(userId);

    return {
      userId,
      status: status
        ? {
            isActive: status.isActive,
            timeRemaining: status.timeRemaining,
            lastActivity: status.lastActivity,
            username: status.username,
            isNearTimeout: status.timeRemaining <= 2 * 60 * 1000, // 2 menit
          }
        : {
            isActive: false,
            message: 'Tidak ada session aktif',
          },
    };
  }

  // Endpoint untuk admin melihat active sessions (opsional)
  @UseGuards(JwtAuthGuard)
  @Get('admin/active-sessions')
  getActiveSessions(@Request() req) {
    // Tambahkan authorization check di sini untuk role admin jika diperlukan
    // if (!req.user.roles.includes('admin')) {
    //   throw new UnauthorizedException('Akses ditolak');
    // }

    const activeSessions = this.slidingThrottlerGuard.getActiveSessions();
    const cacheStats = this.slidingThrottlerGuard.getCacheStats();

    return {
      cacheStats,
      activeSessions,
      timestamp: new Date().toISOString(),
    };
  }
}
