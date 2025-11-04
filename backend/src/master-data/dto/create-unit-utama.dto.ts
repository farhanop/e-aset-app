// src/master-data/dto/create-unit-utama.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUnitUtamaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  kode_unit_utama: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama_unit_utama: string;
}
