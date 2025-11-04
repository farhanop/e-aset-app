// src/master-data/dto/create-gedung.dto.ts
import { IsString, IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class CreateGedungDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  kode_gedung: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama_gedung: string;

  @IsNumber()
  @IsNotEmpty()
  id_kampus: number;
}