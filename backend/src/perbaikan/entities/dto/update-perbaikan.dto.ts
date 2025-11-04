// src/modules/perbaikan/dto/update-perbaikan.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePerbaikanDto } from './create-perbaikan.dto';

export class UpdatePerbaikanDto extends PartialType(CreatePerbaikanDto) {}
