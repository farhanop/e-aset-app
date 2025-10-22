// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../users/user.entity';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findOneByUsername(username);
      if (!user) {
        throw new UnauthorizedException('Username atau password salah');
      }
      
      const isPasswordMatching = await bcrypt.compare(pass, user.password);
      if (!isPasswordMatching) {
        throw new UnauthorizedException('Username atau password salah');
      }
      
      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.error('Error during user validation:', error);
      throw error;
    }
  }

  async login(user: any) {
    try {
      const payload = { 
        username: user.username, 
        sub: user.id_user,
        roles: user.roles 
      };
      return {
        access_token: this.jwtService.sign(payload, {
          expiresIn: '30m',
        }),
      };
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto, fotoProfilPath?: string | null) {
    try {
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        throw new NotFoundException('User tidak ditemukan');
      }

      // Cek jika email baru sudah digunakan oleh user lain
      if (updateProfileDto.email && updateProfileDto.email !== user.email) {
        const existingEmail = await this.usersService.findOneByEmail(updateProfileDto.email);
        if (existingEmail && existingEmail.id_user !== userId) {
          throw new BadRequestException('Email sudah digunakan oleh pengguna lain.');
        }
      }
      
      // Hapus foto lama jika ada dan jika pengguna mengganti fotonya
      if (user.foto_profil && fotoProfilPath !== undefined) {
        const oldPhotoPath = join(process.cwd(), user.foto_profil);
        if (existsSync(oldPhotoPath)) {
          unlinkSync(oldPhotoPath);
        }
      }
      
      // Add foto_profil to the update data if provided
      const updateData: any = {
        nama_lengkap: updateProfileDto.nama_lengkap,
        email: updateProfileDto.email,
        nomor_telepon: updateProfileDto.nomor_telepon,
      };
      
      if (fotoProfilPath !== undefined) {
        updateData.foto_profil = fotoProfilPath;
      }
      
      return this.usersService.update(userId, updateData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    try {
      const { password_lama, password_baru } = changePasswordDto;

      const user = await this.usersService.findOneByIdWithPassword(userId);
      if (!user) {
        throw new NotFoundException('User tidak ditemukan');
      }

      const isPasswordMatching = await bcrypt.compare(password_lama, user.password);
      if (!isPasswordMatching) {
        throw new BadRequestException('Password lama yang Anda masukkan salah.');
      }

      const hashedPassword = await bcrypt.hash(password_baru, await bcrypt.genSalt());
      await this.usersService.update(userId, { password: hashedPassword });

      return { message: 'Password berhasil diubah.' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async removeProfilePhoto(userId: number) {
    try {
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        throw new NotFoundException('User tidak ditemukan');
      }

      if (!user.foto_profil) {
        throw new BadRequestException('Pengguna tidak memiliki foto profil');
      }

      // Hapus file foto dari sistem
      const photoPath = join(process.cwd(), user.foto_profil);
      if (existsSync(photoPath)) {
        unlinkSync(photoPath);
      }

      // Update database untuk menghapus referensi foto
      await this.usersService.update(userId, { foto_profil: null });

      return { message: 'Foto profil berhasil dihapus' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}