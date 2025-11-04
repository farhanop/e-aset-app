// src/modules/mutasi/mutasi.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { MutasiService } from './mutasi.service';
import { CreateMutasiDto } from './dto/create-mutasi.dto';
import { UpdateMutasiDto } from './dto/update-mutasi.dto';
import { Mutasi } from './entities/mutasi.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mutasi')
@UseGuards(JwtAuthGuard) // Melindungi semua rute di controller ini
export class MutasiController {
  constructor(private readonly mutasiService: MutasiService) {}

  @Post()
  async create(
    @Body() createMutasiDto: CreateMutasiDto,
    @Request() req, // Mengambil data request
  ): Promise<Mutasi> {
    // Meneruskan DTO dan data user (petugas) ke service
    return this.mutasiService.create(createMutasiDto, req.user);
  }

  @Get()
  async findAll(): Promise<Mutasi[]> {
    return this.mutasiService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Mutasi> {
    return this.mutasiService.findOne(id);
  }

  @Get('asset/:id_aset')
  async findByAsset(
    @Param('id_aset', ParseIntPipe) id_aset: number,
  ): Promise<Mutasi[]> {
    return this.mutasiService.findByAsset(id_aset);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMutasiDto: UpdateMutasiDto,
  ): Promise<Mutasi> {
    return this.mutasiService.update(id, updateMutasiDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.mutasiService.remove(id);
  }
}
