// src/asset-lifecycle/dto/create-peminjaman.dto.ts
import { IsInt, IsNotEmpty, IsString, IsDateString } from 'class-validator';

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

  @IsDateString()
  @IsNotEmpty()
  tgl_rencana_kembali: Date;
}