// backend/src/assets/dto/update-asset.dto.ts
import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsDate, 
  IsEnum, 
  IsNotEmpty, 
  IsArray, 
  ArrayNotEmpty,
  IsBoolean,
  IsInt,
  Min,
  Max,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AssetStatus {
  TERSEDIA = 'Tersedia',
  DIPINJAM = 'Dipinjam',
  DIPERBAIKI = 'Diperbaiki',
  DIHAPUSKAN = 'Dihapuskan',
  HILANG = 'Hilang',
}

export enum AssetCondition {
  BAIK = 'Baik',
  RUSAK_RINGAN = 'Rusak Ringan',
  RUSAK_BERAT = 'Rusak Berat',
  TIDAK_DAPAT_DIGUNAKAN = 'Tidak Dapat Digunakan',
}

export enum FundingSource {
  APBN = 'APBN',
  APBD = 'APBD',
  BOPTN = 'BOPTN',
  MANDIRI = 'Mandiri',
  HIBAH = 'Hibah',
  LAINNYA = 'Lainnya',
}

export class UpdateAssetDto {
  @ApiPropertyOptional({
    description: 'ID item dari master item',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  id_item?: number;

  @ApiPropertyOptional({
    description: 'ID lokasi',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  id_lokasi?: number;

  @ApiPropertyOptional({
    description: 'ID unit kerja',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  id_unit_kerja?: number;

  @ApiPropertyOptional({
    description: 'ID group',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  id_group?: number | null;

  @ApiPropertyOptional({
    description: 'Merk aset',
    example: 'Lenovo',
  })
  @IsOptional()
  @IsString()
  merk?: string;

  @ApiPropertyOptional({
    description: 'Tipe/model aset',
    example: 'ThinkPad X1',
  })
  @IsOptional()
  @IsString()
  tipe_model?: string;

  @ApiPropertyOptional({
    description: 'Spesifikasi detail aset',
    example: 'Laptop dengan RAM 16GB, SSD 512GB',
  })
  @IsOptional()
  @IsString()
  spesifikasi?: string;

  @ApiPropertyOptional({
    description: 'Tanggal perolehan aset',
    example: '2024-01-10',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  tgl_perolehan?: Date;

  @ApiPropertyOptional({
    description: 'Sumber dana',
    enum: FundingSource,
    example: FundingSource.APBN,
  })
  @IsOptional()
  @IsEnum(FundingSource)
  sumber_dana?: FundingSource;

  @ApiPropertyOptional({
    description: 'Nomor urut aset',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  nomor_urut?: number;

  @ApiPropertyOptional({
    description: 'Jumlah aset',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  jumlah?: number;

  @ApiPropertyOptional({
    description: 'Status aset',
    enum: AssetStatus,
    example: AssetStatus.TERSEDIA,
  })
  @IsOptional()
  @IsEnum(AssetStatus)
  status_aset?: AssetStatus;

  @ApiPropertyOptional({
    description: 'Kondisi terakhir aset',
    enum: AssetCondition,
    example: AssetCondition.BAIK,
  })
  @IsOptional()
  @IsEnum(AssetCondition)
  kondisi_terakhir?: AssetCondition;

  @ApiPropertyOptional({
    description: 'File QR Code',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  @IsString()
  file_qrcode?: string;

  @ApiPropertyOptional({
    description: 'File dokumen pengadaan',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  @IsString()
  file_dokumen?: string;

  @ApiPropertyOptional({
    description: 'Foto barang',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  @IsString()
  foto_barang?: string;

  @ApiPropertyOptional({
    description: 'Status penghapusan (soft delete)',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;
}