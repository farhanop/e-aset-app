// src/master-data/dto/update-unit-utama.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitUtamaDto } from './create-unit-utama.dto';

export class UpdateUnitUtamaDto extends PartialType(CreateUnitUtamaDto) {}