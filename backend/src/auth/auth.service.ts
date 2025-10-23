// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload, {
        // Token akan kedaluwarsa dalam 30 menit
        expiresIn: '30m',
      }),
    };
  }

  /**
   * Mengupdate data profil pengguna yang sedang login.
   * @param userId ID pengguna dari JWT
   * @param updateProfileDto Data profil baru
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
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

    // Update data
    const updatedUser = await this.usersService.update(userId, updateProfileDto);
    
    // Hapus password dari respons
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser as any; // Type assertion untuk menghindari error TypeScript
    return result;
  }

  /**
   * Mengganti password pengguna yang sedang login.
   * @param userId ID pengguna dari JWT
   * @param changePasswordDto DTO berisi password lama dan baru
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { password_lama, password_baru } = changePasswordDto;

    const user = await this.usersService.findOneByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // 1. Verifikasi password lama
    const isPasswordMatching = await bcrypt.compare(password_lama, user.password);
    if (!isPasswordMatching) {
      throw new BadRequestException('Password lama salah.');
    }

    // 2. Hash password baru
    const hashedPassword = await bcrypt.hash(password_baru, await bcrypt.genSalt());

    // 3. Update password di database
    await this.usersService.update(userId, { password: hashedPassword });

    return { message: 'Password berhasil diubah.' };
  }
}