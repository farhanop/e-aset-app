// src/asset-lifecycle/dto/create-peminjaman.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional, // 1. Impor IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePeminjamanDto {
  @IsInt()
  @IsNotEmpty()
  id_aset: number;

  @IsString()
  @IsNotEmpty()
  nama_peminjam: string;

  @IsString()
  @IsNotEmpty()
  identitas_peminjam: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  tgl_rencana_kembali: Date;

  // 2. Tambahkan properti yang hilang di sini
  @IsString()
  @IsOptional() // Tandai sebagai opsional agar tidak wajib diisi
  keterangan_peminjaman?: string;
}
