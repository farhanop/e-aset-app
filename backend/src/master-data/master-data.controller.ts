// src/master-data/master-data.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query, // Tambahkan ini
  BadRequestException, // Tambahkan ini
} from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUnitUtamaDto } from './dto/create-unit-utama.dto';
import { UpdateUnitUtamaDto } from './dto/update-unit-utama.dto';
import { CreateUnitKerjaDto } from './dto/create-unit-kerja.dto';
import { UpdateUnitKerjaDto } from './dto/update-unit-kerja.dto';
import { CreateGedungDto } from './dto/create-gedung.dto';
import { UpdateGedungDto } from './dto/update-gedung.dto';
import { CreateLokasiDto } from './dto/create-lokasi.dto';
import { UpdateLokasiDto } from './dto/update-lokasi.dto';
import { CreateKategoriItemDto } from './dto/create-kategori-item.dto';
import { UpdateKategoriItemDto } from './dto/update-kategori-item.dto';
import { CreateMasterItemDto } from './dto/create-master-item.dto';
import { UpdateMasterItemDto } from './dto/update-master-item.dto';

@Controller('master-data')
@UseGuards(JwtAuthGuard)
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  // === KODE YANG SUDAH ADA TETAP DI BAWAH INI ===
  
  // === UNIT UTAMA ===
  @Get('unit-utama')
  async findAllUnitUtama() {
    return this.masterDataService.findAllUnitUtama();
  }

  @Post('unit-utama')
  @HttpCode(HttpStatus.CREATED)
  async createUnitUtama(@Body() data: CreateUnitUtamaDto) {
    return this.masterDataService.createUnitUtama(data);
  }

  @Patch('unit-utama/:id')
  async updateUnitUtama(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUnitUtamaDto,
  ) {
    return this.masterDataService.updateUnitUtama(id, data);
  }

  @Delete('unit-utama/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUnitUtama(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.removeUnitUtama(id);
  }

  // === UNIT KERJA ===
  @Get('unit-kerja')
  async findAllUnitKerja() {
    return this.masterDataService.findAllUnitKerja();
  }

  @Post('unit-kerja')
  @HttpCode(HttpStatus.CREATED)
  async createUnitKerja(@Body() data: CreateUnitKerjaDto) {
    return this.masterDataService.createUnitKerja(data);
  }

  @Patch('unit-kerja/:id')
  async updateUnitKerja(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUnitKerjaDto,
  ) {
    return this.masterDataService.updateUnitKerja(id, data);
  }

  @Delete('unit-kerja/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUnitKerja(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.removeUnitKerja(id);
  }

  // === GEDUNG ===
  @Get('gedung')
  async findAllGedung() {
    return this.masterDataService.findAllGedung();
  }

  @Post('gedung')
  @HttpCode(HttpStatus.CREATED)
  async createGedung(@Body() data: CreateGedungDto) {
    return this.masterDataService.createGedung(data);
  }

  @Patch('gedung/:id')
  async updateGedung(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateGedungDto,
  ) {
    return this.masterDataService.updateGedung(id, data);
  }

  @Delete('gedung/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeGedung(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.removeGedung(id);
  }

  // === LOKASI ===
  @Get('lokasi')
  async findAllLokasi() {
    return this.masterDataService.findAllLokasi();
  }

  @Post('lokasi')
  @HttpCode(HttpStatus.CREATED)
  async createLokasi(@Body() data: CreateLokasiDto) {
    return this.masterDataService.createLokasi(data);
  }

  @Patch('lokasi/:id')
  async updateLokasi(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateLokasiDto,
  ) {
    return this.masterDataService.updateLokasi(id, data);
  }

  @Delete('lokasi/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLokasi(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.removeLokasi(id);
  }

  // === KATEGORI ITEM ===
  @Get('kategori-item')
  async findAllKategoriItem() {
    return this.masterDataService.findAllKategoriItem();
  }

  @Post('kategori-item')
  @HttpCode(HttpStatus.CREATED)
  async createKategoriItem(@Body() data: CreateKategoriItemDto) {
    return this.masterDataService.createKategoriItem(data);
  }

  @Patch('kategori-item/:id')
  async updateKategoriItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateKategoriItemDto,
  ) {
    return this.masterDataService.updateKategoriItem(id, data);
  }

  @Delete('kategori-item/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeKategoriItem(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.removeKategoriItem(id);
  }

  // === MASTER ITEM ===
  @Get('master-item')
  async findAllMasterItem() {
    return this.masterDataService.findAllMasterItem();
  }

  @Post('master-item')
  @HttpCode(HttpStatus.CREATED)
  async createMasterItem(@Body() data: CreateMasterItemDto) {
    return this.masterDataService.createMasterItem(data);
  }

  @Patch('master-item/:id')
  async updateMasterItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMasterItemDto,
  ) {
    return this.masterDataService.updateMasterItem(id, data);
  }

  @Delete('master-item/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMasterItem(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.removeMasterItem(id);
  }

  // TAMBAHKAN 2 ENDPOINT BARU UNTUK FITUR LAPORAN DI BAWAH INI
  
  // Endpoint untuk mendapatkan unit kerja berdasarkan gedung
  @Get('unit-kerja/by-gedung/:id_gedung')
  async findUnitKerjaByGedung(@Param('id_gedung', ParseIntPipe) id_gedung: number) {
    try {
      const unitKerjaList = await this.masterDataService.findUnitKerjaByGedung(id_gedung);
      return {
        success: true,
        message: `Berhasil mendapatkan data unit kerja untuk gedung ID ${id_gedung}`,
        data: unitKerjaList
      };
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data unit kerja: ${error.message}`);
    }
  }

  // Endpoint untuk mendapatkan lokasi berdasarkan gedung dan unit kerja
  @Get('lokasi/by-gedung-unit')
  async findLokasiByGedungAndUnit(
    @Query('gedungId', ParseIntPipe) gedungId: number,
    @Query('unitKerjaId', ParseIntPipe) unitKerjaId: number
  ) {
    try {
      const lokasiList = await this.masterDataService.findLokasiByGedungAndUnit(gedungId, unitKerjaId);
      return {
        success: true,
        message: `Berhasil mendapatkan data lokasi untuk gedung ID ${gedungId} dan unit kerja ID ${unitKerjaId}`,
        data: lokasiList
      };
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data lokasi: ${error.message}`);
    }
  }
}