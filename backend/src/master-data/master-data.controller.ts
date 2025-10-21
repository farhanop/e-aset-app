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
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUnitUtamaDto } from './dto/create-unit-utama.dto';
import { UpdateUnitUtamaDto } from './dto/update-unit-utama.dto';
import { CreateUnitKerjaDto } from './dto/create-unit-kerja.dto';
import { UpdateUnitKerjaDto } from './dto/update-unit-kerja.dto';
import { CreateGedungDto } from './dto/create-gedung.dto';
import { UpdateGedungDto } from './dto/update-gedung.dto';
import { CreateKampusDto } from './dto/create-kampus.dto';
import { UpdateKampusDto } from './dto/update-kampus.dto';
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

  // === KAMPUS ===
  @Post('kampus')
  @HttpCode(HttpStatus.CREATED)
  async createKampus(@Body(ValidationPipe) createKampusDto: CreateKampusDto) {
    return this.masterDataService.createKampus(createKampusDto);
  }

  @Get('kampus')
  async findAllKampus() {
    return this.masterDataService.findAllKampus();
  }

  @Get('kampus/:id')
  async findOneKampus(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.findOneKampus(id);
  }

  @Patch('kampus/:id')
  async updateKampus(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateKampusDto: UpdateKampusDto,
  ) {
    return this.masterDataService.updateKampus(id, updateKampusDto);
  }

  @Delete('kampus/:id')
  @HttpCode(HttpStatus.OK)
  async removeKampus(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.removeKampus(id);
  }

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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  async removeUnitKerja(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.removeUnitKerja(id);
  }

  // === GEDUNG ===
  @Get('gedung')
  async findAllGedung() {
    return this.masterDataService.findAllGedung();
  }

  @Get('gedung/by-kampus/:id_kampus')
  async findGedungByKampus(@Param('id_kampus', ParseIntPipe) id_kampus: number) {
    return this.masterDataService.findGedungByKampus(id_kampus);
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
  @HttpCode(HttpStatus.OK)
  async removeGedung(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.removeGedung(id);
  }

  // === LOKASI ===
  @Get('lokasi')
  async findAllLokasi() {
    return this.masterDataService.findAllLokasi();
  }

  @Get('lokasi/by-gedung/:id_gedung')
  async findLokasiByGedung(@Param('id_gedung', ParseIntPipe) id_gedung: number) {
    return this.masterDataService.findLokasiByGedung(id_gedung);
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  async removeMasterItem(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.removeMasterItem(id);
  }

  // === ENDPOINT UNTUK FITUR LAPORAN ===
  
  // Endpoint untuk mendapatkan unit kerja berdasarkan gedung
  @Get('unit-kerja/by-gedung/:id_gedung')
  async findUnitKerjaByGedung(@Param('id_gedung', ParseIntPipe) id_gedung: number) {
    return this.masterDataService.findUnitKerjaByGedung(id_gedung);
  }

  // Endpoint untuk mendapatkan lokasi berdasarkan gedung dan unit kerja
  @Get('lokasi/by-gedung-unit')
  async findLokasiByGedungAndUnit(
    @Query('gedungId', ParseIntPipe) gedungId: number,
    @Query('unitKerjaId', ParseIntPipe) unitKerjaId: number
  ) {
    return this.masterDataService.findLokasiByGedungAndUnit(gedungId, unitKerjaId);
  }
}