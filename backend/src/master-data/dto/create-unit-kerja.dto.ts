// src/master-data/dto/create-unit-kerja.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';

export class CreateUnitKerjaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  kode_unit: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama_unit: string;

  @IsNumber()
  @IsNotEmpty()
  id_unit_utama: number;
}