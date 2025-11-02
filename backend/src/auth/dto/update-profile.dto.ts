// backend/src/auth/dto/update-profile.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional() 
  @MaxLength(100)
  nama_lengkap?: string; 

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional() 
  @MaxLength(100)
  email?: string; 

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  nomor_telepon?: string;

  @ApiPropertyOptional({
    description:
      'Path ke foto profil di server (mis. /uploads/profile-photos/abc.jpg)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  foto_profil?: string;
}
