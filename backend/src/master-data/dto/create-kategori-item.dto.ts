// src/master-data/dto/create-kategori-item.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateKategoriItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama_kategori: string;
}