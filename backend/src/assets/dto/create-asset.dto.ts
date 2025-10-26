// backend/src/assets/dto/create-asset.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({
    description: 'ID item dari master item',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id_item: number;

  @ApiProperty({
    description: 'ID lokasi',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id_lokasi: number;

  @ApiProperty({
    description: 'ID unit kerja',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id_unit_kerja: number;

  @ApiPropertyOptional({
    description: 'Merk aset',
    example: 'Lenovo',
  })
  @IsString()
  @IsOptional()
  merk?: string;

  @ApiPropertyOptional({
    description: 'Tipe/model aset',
    example: 'ThinkPad X1',
  })
  @IsString()
  @IsOptional()
  tipe_model?: string;

  @ApiPropertyOptional({
    description: 'Spesifikasi detail aset',
    example: 'Laptop dengan RAM 16GB, SSD 512GB',
  })
  @IsString()
  @IsOptional()
  spesifikasi?: string;

  @ApiProperty({
    description: 'Tanggal perolehan aset',
    example: '2024-01-10',
  })
  @IsNotEmpty()
  tgl_perolehan: Date;

  @ApiPropertyOptional({
    description: 'Sumber dana',
    example: 'APBN',
  })
  @IsString()
  @IsOptional()
  sumber_dana?: string;

  @ApiPropertyOptional({
    description: 'Jumlah aset yang akan dibuat',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  jumlah: number = 1;

  @ApiPropertyOptional({
    description: 'Foto barang',
    example: '/uploads/foto-barang/abc123.jpg',
  })
  @IsString()
  @IsOptional()
  foto_barang?: string;

  @ApiPropertyOptional({
    description: 'File dokumen',
    example: '/uploads/dokumen/xyz789.pdf',
  })
  @IsString()
  @IsOptional()
  file_dokumen?: string;

  @ApiPropertyOptional({
    description: 'Status aset',
    example: 'Tersedia',
    default: 'Tersedia',
  })
  @IsString()
  @IsOptional()
  status_aset?: string = 'Tersedia';

  @ApiPropertyOptional({
    description: 'Kondisi terakhir aset',
    example: 'Baik',
    default: 'Baik',
  })
  @IsString()
  @IsOptional()
  kondisi_terakhir?: string = 'Baik';

  @ApiPropertyOptional({
    description: 'ID group aset',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  id_group?: number;
}
