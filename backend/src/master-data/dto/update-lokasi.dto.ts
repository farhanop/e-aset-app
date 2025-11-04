// src/master-data/dto/update-lokasi.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLokasiDto } from './create-lokasi.dto';

export class UpdateLokasiDto extends PartialType(CreateLokasiDto) {}