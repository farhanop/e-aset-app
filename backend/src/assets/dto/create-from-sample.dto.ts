// backend/src/assets/dto/create-from-sample.dto.ts
import { IsString, IsInt, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFromSampleDto {
  @ApiProperty({
    description: 'Kode kampus',
    example: 'U',
  })
  @IsString()
  @IsNotEmpty()
  kampus: string;

  @ApiProperty({
    description: 'Kode gedung',
    example: '2',
  })
  @IsString()
  @IsNotEmpty()
  gedung: string;

  @ApiProperty({
    description: 'Nomor lantai',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  lantai: number;

  @ApiProperty({
    description: 'Kode ruangan',
    example: 'LAB301',
  })
  @IsString()
  @IsNotEmpty()
  ruangan: string;

  @ApiProperty({
    description: 'Kode fakultas',
    example: 'FT',
  })
  @IsString()
  @IsNotEmpty()
  fakultas: string;

  @ApiProperty({
    description: 'Kode prodi',
    example: '3',
  })
  @IsString()
  @IsNotEmpty()
  prodi: string;

  @ApiProperty({
    description: 'Kode jenis barang',
    example: 'PC',
  })
  @IsString()
  @IsNotEmpty()
  jenis_barang: string;

  @ApiProperty({
    description: 'Jumlah barang',
    example: 10,
  })
  @IsInt()
  @Min(1)
  jumlah: number;

  @ApiProperty({
    description: 'Tahun perolehan',
    example: 2025,
  })
  @IsInt()
  @Min(2000)
  @Max(2030)
  tahun: number;
}
