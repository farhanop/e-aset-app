// backend/src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Request, Get, Patch, Body, ValidationPipe, UseInterceptors, UploadedFile, Delete, BadRequestException, Logger } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    try {
      this.logger.log(`User ${req.user.username} is attempting to login`);
      const result = await this.authService.login(req.user);
      this.logger.log(`User ${req.user.username} logged in successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Login failed for user ${req.user.username}:`, error.stack);
      throw error;
    }
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(
    FileInterceptor('foto_profil', {
      storage: diskStorage({
        destination: './uploads/profile-photos',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async updateProfile(
    @Request() req,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const userId = req.user.id_user;
      
      // Create DTO from body
      const updateProfileDto: UpdateProfileDto = {
        nama_lengkap: body.nama_lengkap,
        email: body.email,
        nomor_telepon: body.nomor_telepon,
      };
      
      // Handle file upload or removal
      let fotoProfilPath: string | null | undefined = undefined;
      if (file) {
        fotoProfilPath = `/uploads/profile-photos/${file.filename}`;
      } else if (body.remove_photo === 'true') {
        fotoProfilPath = null;
      }
      
      return this.authService.updateProfile(userId, updateProfileDto, fotoProfilPath);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/change-password')
  async changePassword(
    @Request() req,
    @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.id_user;
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/photo')
  async removeProfilePhoto(@Request() req) {
    const userId = req.user.id_user;
    return this.authService.removeProfilePhoto(userId);
  }
}