// src/assets/dto/get-assets-filter.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsString, Min } from 'class-validator';

export class GetAssetsFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_lokasi?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_unit_kerja?: number;
  
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_item?: number;

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;
  
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
  
  @IsOptional()
  @IsString()
  sortBy?: string = 'tgl_perolehan';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}