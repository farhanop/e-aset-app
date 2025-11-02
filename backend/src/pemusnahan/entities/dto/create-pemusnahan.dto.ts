// src/modules/pemusnahan/dto/create-pemusnahan.dto.ts
import {
  IsString,
  IsDate,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { PemusnahanMetode } from '../pemusnahan.entity';

export class CreatePemusnahanDto {
  @IsNumber()
  id_aset: number;

  @IsDate()
  tgl_pemusnahan: Date;

  @IsEnum(PemusnahanMetode)
  metode_pemusnahan: PemusnahanMetode;

  @IsString()
  alasan_pemusnahan: string;

  @IsOptional()
  @IsString()
  no_surat_persetujuan: string;

  @IsNumber()
  id_petugas_pemusnahan: number;
}
