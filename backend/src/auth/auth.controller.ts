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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpException,
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
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { Express } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    @Inject(SlidingThrottlerGuard)
    private slidingThrottlerGuard: SlidingThrottlerGuard,
  ) {}

  @Throttle({ default: { limit: 50, ttl: 1800 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    console.log('=== 🚀 LOGIN ENDPOINT CALLED ===');
    console.log('📨 Request user object from guard:', req.user);
    if (!req.user) {
      console.log('❌ No user data found in request after LocalAuthGuard');
      throw new UnauthorizedException(
        'User data tidak ditemukan setelah validasi',
      );
    }
    const loginResult = await this.authService.login(req.user);
    console.log('=== ✅ LOGIN ENDPOINT COMPLETED ===');
    return loginResult;
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    console.log('👤 GET /profile endpoint called. User from token:', req.user);
    const userId = req.user.sub || req.user.id_user;
    if (!userId) {
      console.error('❌ User object from token does not contain ID:', req.user);
      throw new UnauthorizedException(
        'Token tidak valid atau tidak memiliki ID pengguna.',
      );
    }
    console.log('🔍 Extracted userId from token:', userId);

    const user = await this.usersService.findOneById(userId);
    if (!user) {
      console.error(`❌ User with ID ${userId} not found in database.`);
      throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan.`);
    }

    const sessionInfo = this.slidingThrottlerGuard.getUserSessionInfo(userId);
    console.log('ℹ️ Session info for user:', sessionInfo);

    const result = { ...user, sessionInfo };
    console.log('📤 Sending profile data:', result);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(
    FileInterceptor('foto_profil_file', {
      storage: diskStorage({
        destination: './uploads/foto_profil',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const fileExt = extname(file.originalname);
          const filename = `${randomName}${fileExt}`;
          console.log(`📁 Generated filename: ${filename}`);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log(`🔍 File filter checking: ${file.originalname}`);
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/i)) {
          console.log(`❌ File type rejected: ${file.mimetype}`);
          return cb(
            new BadRequestException(
              'Hanya file gambar (JPG, JPEG, PNG, GIF) yang diizinkan!',
            ),
            false,
          );
        }
        console.log(`✅ File type accepted: ${file.mimetype}`);
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async updateProfile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('=== 🔄 PATCH /profile endpoint called ===');
    const userId = req.user.sub;

    if (!userId) {
      console.error('❌ User ID not found in token:', req.user);
      throw new UnauthorizedException('Token tidak valid');
    }

    console.log(`👤 User ID: ${userId}`);
    console.log('📄 Raw req.body:', req.body);
    console.log(
      '📁 File received:',
      file
        ? {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          }
        : 'No file',
    );

    // 🔧 PERBAIKAN: Pastikan folder uploads exists
    try {
      await fs.access('./uploads/foto_profil');
    } catch (error) {
      console.log('📁 Creating uploads directory...');
      await fs.mkdir('./uploads/foto_profil', { recursive: true });
    }

    // Validasi DTO dari form data
    const dtoInstance = plainToInstance(UpdateProfileDto, req.body);
    console.log('🔄 DTO instance created:', dtoInstance);

    const errors = await validate(dtoInstance);
    if (errors.length > 0) {
      console.error('❌ DTO validation failed:', errors);
      const errorMessages = errors
        .map((err) => Object.values(err.constraints || {}))
        .flat();
      throw new BadRequestException(
        `Validasi gagal: ${errorMessages.join('; ')}`,
      );
    }
    console.log('✅ DTO validation successful');

    // 🔧 PERBAIKAN: Handle photo removal dan upload
    const wantsToDeletePhoto = req.body.foto_profil_remove === 'true';
    const hasNewPhoto = !!file;

    console.log(`🗑️ Delete photo requested: ${wantsToDeletePhoto}`);
    console.log(`🖼️ New photo uploaded: ${hasNewPhoto}`);

    // Handle penghapusan foto lama jika ada foto baru atau request hapus
    if (hasNewPhoto || wantsToDeletePhoto) {
      try {
        const existingUser = await this.usersService.findOneById(userId);
        if (existingUser?.foto_profil) {
          const oldPhotoPath = existingUser.foto_profil;
          // Hapus hanya jika foto berasal dari upload directory kita
          if (oldPhotoPath.startsWith('/uploads/foto_profil/')) {
            const absoluteOldPath = join(
              process.cwd(),
              'uploads',
              'foto_profil',
              oldPhotoPath.split('/').pop()!,
            );
            try {
              await fs.unlink(absoluteOldPath);
              console.log(
                `🗑️ Successfully deleted old photo: ${absoluteOldPath}`,
              );
            } catch (err) {
              console.warn(`⚠️ Could not delete old photo: ${err.message}`);
            }
          }
        }
      } catch (error) {
        console.warn(
          '⚠️ Error fetching existing user for photo cleanup:',
          error.message,
        );
      }
    }

    // 🔧 PERBAIKAN: Set foto_profil dalam DTO berdasarkan kondisi
    if (file) {
      dtoInstance.foto_profil = `/uploads/foto_profil/${file.filename}`;
      console.log(`🖼️ New photo path set: ${dtoInstance.foto_profil}`);
    } else if (wantsToDeletePhoto) {
      dtoInstance.foto_profil = '';
      console.log('🗑️ Photo set to empty string for deletion');
    }
    // Jika tidak ada file dan tidak hapus foto, biarkan undefined (tidak update field foto)

    console.log('💾 Final DTO for update:', dtoInstance);

    try {
      const updatedUser = await this.authService.updateProfile(
        userId,
        dtoInstance,
      );
      console.log('✅ Profile updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('❌ Error in authService.updateProfile:', error);

      // 🔧 PERBAIKAN: Rollback file upload jika update gagal
      if (file) {
        try {
          const filePath = `./uploads/foto_profil/${file.filename}`;
          await fs.unlink(filePath);
          console.log(`🗑️ Rollback: Deleted uploaded file ${file.filename}`);
        } catch (rollbackError) {
          console.warn(
            '⚠️ Could not rollback uploaded file:',
            rollbackError.message,
          );
        }
      }

      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/change-password')
  async changePassword(
    @Request() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    changePasswordDto: ChangePasswordDto,
  ) {
    console.log(
      `🔑 POST /profile/change-password called for userId: ${req.user.sub}`,
    );
    const userId = req.user.sub;
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/others')
  async logoutOtherSessions(@Request() req) {
    console.log(
      `💨 DELETE /sessions/others called for userId: ${req.user.sub}`,
    );
    const userId = req.user.sub;
    const currentToken = req.headers.authorization?.replace('Bearer ', '');
    if (!currentToken) {
      console.warn('⚠️ Could not extract current token from headers.');
    }
    const result = await this.slidingThrottlerGuard.clearUserSessions(
      userId,
      currentToken,
    );
    console.log(
      `✅ Cleared other sessions for userId ${userId}. Result: ${result}`,
    );

    return {
      message: result
        ? 'Semua session lain berhasil dihapus'
        : 'Tidak ada session lain yang aktif atau gagal menghapus',
      success: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('session-status')
  getSessionStatus(@Request() req) {
    const userId = req.user.sub;
    console.log(`ℹ️ GET /session-status called for userId: ${userId}`);
    const status = this.slidingThrottlerGuard.getUserActivityStatus(userId);
    console.log('ℹ️ Session status result:', status);
    return {
      userId,
      status: status
        ? {
            isActive: status.isActive,
            timeRemaining: status.timeRemaining,
            lastActivity: status.lastActivity,
            username: status.username,
            isNearTimeout: status.timeRemaining <= 2 * 60 * 1000,
          }
        : { isActive: false, message: 'Tidak ada session aktif terdeteksi' },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/active-sessions')
  getActiveSessions(@Request() req) {
    console.log(
      `🛡️ GET /admin/active-sessions called by user: ${req.user.username} (Role: ${req.user.role})`,
    );
    if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
      console.warn(
        `🚫 Unauthorized access attempt to /admin/active-sessions by user ${req.user.username}`,
      );
      throw new UnauthorizedException(
        'Akses ditolak. Memerlukan peran admin atau super-admin.',
      );
    }
    const activeSessions = this.slidingThrottlerGuard.getActiveSessions();
    const cacheStats = this.slidingThrottlerGuard.getCacheStats();
    console.log(
      `📊 Returning ${activeSessions.length} active sessions and cache stats.`,
    );

    return {
      cacheStats,
      activeSessions,
      timestamp: new Date().toISOString(),
    };
  }
}
