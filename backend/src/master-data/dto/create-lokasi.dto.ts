// src/master-data/dto/create-lokasi.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsNumber, IsOptional } from 'class-validator';

export class CreateLokasiDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  kode_ruangan: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama_ruangan: string;

  @IsNumber()
  @IsNotEmpty()
  lantai: number;

  @IsNumber()
  @IsNotEmpty()
  id_gedung: number;

  @IsNumber()
  @IsOptional()
  id_unit_kerja: number;
}