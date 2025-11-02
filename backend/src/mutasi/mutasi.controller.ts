// src/modules/mutasi/mutasi.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MutasiService } from './mutasi.service';
import { CreateMutasiDto } from './dto/create-mutasi.dto';
import { UpdateMutasiDto } from './dto/update-mutasi.dto';
import { Mutasi } from './entities/mutasi.entity';

@Controller('mutasi')
export class MutasiController {
  constructor(private readonly mutasiService: MutasiService) {}

  @Post()
  async create(@Body() createMutasiDto: CreateMutasiDto): Promise<Mutasi> {
    return this.mutasiService.create(createMutasiDto);
  }

  @Get()
  async findAll(): Promise<Mutasi[]> {
    return this.mutasiService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Mutasi> {
    return this.mutasiService.findOne(+id);
  }

  @Get('asset/:id_aset')
  async findByAsset(@Param('id_aset') id_aset: string): Promise<Mutasi[]> {
    return this.mutasiService.findByAsset(+id_aset);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMutasiDto: UpdateMutasiDto,
  ): Promise<Mutasi> {
    return this.mutasiService.update(+id, updateMutasiDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.mutasiService.remove(+id);
  }
}
