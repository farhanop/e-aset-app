// src/modules/mutasi/dto/create-mutasi.dto.ts
import { IsString, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateMutasiDto {
  @IsNumber()
  id_aset: number;

  // HAPUS id_lokasi_lama. Ini akan diambil dari service.

  @IsNumber()
  id_lokasi_baru: number;

  // Tambahkan id_unit_kerja_baru (opsional)
  @IsOptional()
  @IsNumber()
  id_unit_kerja_baru?: number;

  @IsOptional()
  @IsDateString() // Gunakan IsDateString untuk JSON, service akan mengubahnya
  tgl_mutasi?: Date;

  @IsOptional()
  @IsString()
  catatan?: string;

  // HAPUS id_petugas. Ini akan diambil dari controller.
}
