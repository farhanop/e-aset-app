import { PartialType } from '@nestjs/mapped-types';
import { CreateKampusDto } from './create-kampus.dto';

export class UpdateKampusDto extends PartialType(CreateKampusDto) {}
