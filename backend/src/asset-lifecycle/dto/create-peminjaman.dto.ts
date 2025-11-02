// src/asset-lifecycle/dto/create-peminjaman.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsDate,
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
}
