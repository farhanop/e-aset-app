// src/asset-lifecycle/dto/pengembalian.dto.ts
import { IsInt, IsNotEmpty, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class PengembalianDto {
  @IsInt()
  @IsNotEmpty()
  id_peminjaman: number;

  @IsDate()
  @Type(() => Date)
  tgl_aktual_kembali?: Date;
}
