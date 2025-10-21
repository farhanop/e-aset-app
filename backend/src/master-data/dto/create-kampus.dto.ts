import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateKampusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  kode_kampus: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nama_kampus: string;

  @IsString()
  @IsOptional()
  alamat?: string;
}
