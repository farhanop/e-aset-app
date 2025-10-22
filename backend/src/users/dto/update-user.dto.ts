// backend/src/users/dto/update-user.dto.ts
import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  username?: string;

  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  nama_lengkap?: string;

  @IsString()
  @IsOptional()
  nomor_telepon?: string;

  @IsString()
  @IsOptional()
  status?: string;
}