// backend/src/assets/dto/filter-assets.dto.ts
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAssetsDto {
  @ApiPropertyOptional({
    description: 'Kode kampus',
    example: 'U',
  })
  @IsOptional()
  @IsString()
  kampus?: string;

  @ApiPropertyOptional({
    description: 'Kode gedung',
    example: '2',
  })
  @IsOptional()
  @IsString()
  gedung?: string;

  @ApiPropertyOptional({
    description: 'Nomor lantai',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  lantai?: number;

  @ApiPropertyOptional({
    description: 'Kode ruangan',
    example: 'LAB301',
  })
  @IsOptional()
  @IsString()
  ruangan?: string;

  @ApiPropertyOptional({
    description: 'Kode fakultas',
    example: 'FT',
  })
  @IsOptional()
  @IsString()
  fakultas?: string;

  @ApiPropertyOptional({
    description: 'Kode prodi',
    example: '3',
  })
  @IsOptional()
  @IsString()
  prodi?: string;

  @ApiPropertyOptional({
    description: 'Kode jenis barang',
    example: 'PC',
  })
  @IsOptional()
  @IsString()
  jenis_barang?: string;

  @ApiPropertyOptional({
    description: 'Tahun perolehan',
    example: 2025,
  })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2030)
  @Type(() => Number)
  tahun?: number;
}
