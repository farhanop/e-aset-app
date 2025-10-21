// src/master-data/dto/update-gedung.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateGedungDto } from './create-gedung.dto';

export class UpdateGedungDto extends PartialType(CreateGedungDto) {}
