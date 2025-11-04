// src/master-data/dto/create-master-item.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateMasterItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nama_item: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  kode_item: string;

  @IsNumber()
  @IsNotEmpty()
  id_kategori: number;

  @IsEnum(['Individual', 'Stok'])
  @IsNotEmpty()
  metode_pelacakan: string;

  @IsNumber()
  @IsOptional()
  umur_ekonomis: number;
}