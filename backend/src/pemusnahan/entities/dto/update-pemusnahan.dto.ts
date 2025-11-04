// src/modules/pemusnahan/dto/update-pemusnahan.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePemusnahanDto } from './create-pemusnahan.dto';

export class UpdatePemusnahanDto extends PartialType(CreatePemusnahanDto) {}
