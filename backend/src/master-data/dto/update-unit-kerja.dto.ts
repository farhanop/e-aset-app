// src/master-data/dto/update-unit-kerja.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitKerjaDto } from './create-unit-kerja.dto';

export class UpdateUnitKerjaDto extends PartialType(CreateUnitKerjaDto) {}