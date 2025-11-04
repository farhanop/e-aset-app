// src/master-data/dto/update-kategori-item.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateKategoriItemDto } from './create-kategori-item.dto';

export class UpdateKategoriItemDto extends PartialType(CreateKategoriItemDto) {}