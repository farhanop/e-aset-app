// src/modules/perbaikan/dto/create-perbaikan.dto.ts
import {
  IsString,
  IsDate,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { PerbaikanStatus } from '../../entities/perbaikan.entity';

export class CreatePerbaikanDto {
  @IsNumber()
  id_aset: number;

  @IsDate()
  tgl_lapor_rusak: Date;

  @IsString()
  deskripsi_kerusakan: string;

  @IsNumber()
  id_pelapor: number;

  @IsOptional()
  @IsString()
  tindakan_perbaikan: string;

  @IsOptional()
  biaya_perbaikan: number;

  @IsOptional()
  @IsDate()
  tgl_selesai_perbaikan: Date;

  @IsOptional()
  @IsEnum(PerbaikanStatus)
  status_perbaikan: PerbaikanStatus;
}
