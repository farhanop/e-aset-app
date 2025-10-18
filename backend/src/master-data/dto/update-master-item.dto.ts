// src/master-data/dto/update-master-item.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMasterItemDto } from './create-master-item.dto';

export class UpdateMasterItemDto extends PartialType(CreateMasterItemDto) {}