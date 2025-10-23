// backend\src\auth\auth.controller.ts
import { Controller, Post, UseGuards, Request, Get, Patch, Body, ValidationPipe } from '@nestjs/common';
import { UseInterceptors, UploadedFile, BadRequestException, Request as NestRequest } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  // Aturan yang lebih ketat KHUSUS untuk endpoint login
  // Aturan ini akan menimpa (override) aturan global yang ada di app.module.ts
  @Throttle({ default: { limit: 50, ttl: 60000 } }) // Hanya 50 percobaan dalam 1 menit
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // Melewati (skip) rate limit untuk endpoint profile
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
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
  async uploadProfilePhoto(@NestRequest() req, @UploadedFile() file: Express.Multer.File) {
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
              console.warn('Could not delete old profile photo:', absoluteOld, err.message || err);
            }
          }

          // Persist new foto_profil on user
          const updated = await this.usersService.update(userId, { foto_profil: newPath } as any);
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
}