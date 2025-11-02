// src/modules/mutasi/dto/create-mutasi.dto.ts
import { IsString, IsDate, IsNumber, IsOptional } from 'class-validator';

export class CreateMutasiDto {
  @IsNumber()
  id_aset: number;

  @IsNumber()
  id_lokasi_lama: number;

  @IsNumber()
  id_lokasi_baru: number;

  @IsDate()
  tgl_mutasi: Date;

  @IsOptional()
  @IsString()
  catatan: string;

  @IsNumber()
  id_petugas: number;
}
