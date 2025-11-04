// src/asset-lifecycle/dto/pengembalian.dto.ts
import { IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PengembalianDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  tgl_aktual_kembali?: Date;

  @IsString()
  kondisi_kembali: string;

  @IsString()
  @IsOptional()
  keterangan_pengembalian?: string;
}
