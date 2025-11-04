// src/modules/perbaikan/perbaikan.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { PerbaikanService } from './perbaikan.service';
import { CreatePerbaikanDto } from './dto/create-perbaikan.dto';
import { UpdatePerbaikanDto } from './dto/update-perbaikan.dto';
import { Perbaikan } from '../entities/perbaikan.entity';
import { PerbaikanStatus } from '../entities/perbaikan.entity';

@Controller('perbaikan')
export class PerbaikanController {
  constructor(private readonly perbaikanService: PerbaikanService) {}

  @Post()
  async create(
    @Body() createPerbaikanDto: CreatePerbaikanDto,
  ): Promise<Perbaikan> {
    return this.perbaikanService.create(createPerbaikanDto);
  }

  @Get()
  async findAll(): Promise<Perbaikan[]> {
    return this.perbaikanService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Perbaikan> {
    return this.perbaikanService.findOne(+id);
  }

  @Get('asset/:id_aset')
  async findByAsset(@Param('id_aset') id_aset: string): Promise<Perbaikan[]> {
    return this.perbaikanService.findByAsset(+id_aset);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePerbaikanDto: UpdatePerbaikanDto,
  ): Promise<Perbaikan> {
    return this.perbaikanService.update(+id, updatePerbaikanDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PerbaikanStatus,
  ): Promise<Perbaikan> {
    return this.perbaikanService.updateStatus(+id, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.perbaikanService.remove(+id);
  }
}
