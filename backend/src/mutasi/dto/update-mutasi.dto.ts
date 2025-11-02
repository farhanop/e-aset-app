// src/modules/mutasi/dto/update-mutasi.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateMutasiDto } from './create-mutasi.dto';

export class UpdateMutasiDto extends PartialType(CreateMutasiDto) {}
