// backend\src\auth\dto\change-password.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  password_lama: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password baru minimal harus 8 karakter' })
  password_baru: string;
}
