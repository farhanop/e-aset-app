// src/modules/pemusnahan/pemusnahan.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PemusnahanService } from './pemusnahan.service';
import { CreatePemusnahanDto } from './dto/create-pemusnahan.dto';
import { UpdatePemusnahanDto } from './dto/update-pemusnahan.dto';
import { Pemusnahan } from '../entities/pemusnahan.entity';

@Controller('pemusnahan')
export class PemusnahanController {
  constructor(private readonly pemusnahanService: PemusnahanService) {}

  @Post()
  async create(
    @Body() createPemusnahanDto: CreatePemusnahanDto,
  ): Promise<Pemusnahan> {
    return this.pemusnahanService.create(createPemusnahanDto);
  }

  @Get()
  async findAll(): Promise<Pemusnahan[]> {
    return this.pemusnahanService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Pemusnahan> {
    return this.pemusnahanService.findOne(+id);
  }

  @Get('asset/:id_aset')
  async findByAsset(@Param('id_aset') id_aset: string): Promise<Pemusnahan[]> {
    return this.pemusnahanService.findByAsset(+id_aset);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePemusnahanDto: UpdatePemusnahanDto,
  ): Promise<Pemusnahan> {
    return this.pemusnahanService.update(+id, updatePemusnahanDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.pemusnahanService.remove(+id);
  }
}
