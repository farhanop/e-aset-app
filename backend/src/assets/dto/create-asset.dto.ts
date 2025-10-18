// src/assets/dto/create-asset.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAssetDto {
  @IsInt()
  @IsNotEmpty()
  id_item: number;

  @IsInt()
  @IsNotEmpty()
  id_lokasi: number;

  @IsInt()
  @IsNotEmpty()
  id_unit_kerja: number;

  @IsString()
  @IsOptional()
  merk?: string;

  @IsString()
  @IsOptional()
  tipe_model?: string;

  @IsString()
  @IsOptional()
  spesifikasi?: string;

  @IsNotEmpty()
  tgl_perolehan: Date;

  @IsString()
  @IsOptional()
  sumber_dana?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  jumlah: number = 1; // Untuk input massal, default-nya 1
}
