// src/assets/assets.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  Param,
  Delete,
  Patch,
  NotFoundException,
  Put,
  BadRequestException,
  Res,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as qr from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Response } from 'express';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // API yang sudah ada tetap di bawah ini

  @Post()
  async create(@Body(new ValidationPipe()) createAssetDto: CreateAssetDto) {
    try {
      const assets = await this.assetsService.create(createAssetDto);
      
      return {
        message: `Berhasil membuat ${assets.length} aset dengan QR Code`,
        data: assets
      };
    } catch (error) {
      throw new BadRequestException(`Gagal membuat aset: ${error.message}`);
    }
  }

  @Get()
  async findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const asset = await this.assetsService.findOne(+id);
      return asset;
    } catch (error) {
      throw new NotFoundException(`Aset dengan ID ${id} tidak ditemukan`);
    }
  }

  @Get(':id/qrcode')
  async getQRCode(@Param('id') id: string, @Res() res: Response) {
    try {
      const asset = await this.assetsService.findOne(+id);
      
      if (!asset.file_qrcode) {
        throw new NotFoundException('QR Code untuk aset ini tidak ditemukan');
      }
      
      const qrCodePath = path.join(process.cwd(), asset.file_qrcode);
      const qrCodeBuffer = await fs.readFile(qrCodePath);
      
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': qrCodeBuffer.length,
      });
      
      res.send(qrCodeBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Gagal mengambil QR Code: ${error.message}`);
    }
  }

  @Post(':id/regenerate-qrcode')
  async regenerateQRCode(@Param('id') id: string) {
    try {
      const asset = await this.assetsService.findOne(+id);
      
      const qrCodeBuffer = await qr.toBuffer(asset.kode_aset, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      const uploadDir = path.join(process.cwd(), 'uploads', 'qrcodes');
      await fs.mkdir(uploadDir, { recursive: true });
      
      if (asset.file_qrcode) {
        try {
          const oldQrCodePath = path.join(process.cwd(), asset.file_qrcode);
          await fs.unlink(oldQrCodePath);
        } catch (error) {
          console.error('Gagal menghapus QR Code lama:', error);
        }
      }
      
      const qrCodeFileName = `qrcode-${asset.id_aset}-${Date.now()}.png`;
      const qrCodePath = path.join(uploadDir, qrCodeFileName);
      await fs.writeFile(qrCodePath, qrCodeBuffer);
      
      const updatedAsset = await this.assetsService.updateQRCodePath(
        asset.id_aset, 
        `/uploads/qrcodes/${qrCodeFileName}`
      );
      
      return {
        message: 'QR Code berhasil diregenerasi',
        data: updatedAsset
      };
    } catch (error) {
      throw new BadRequestException(`Gagal meregenerasi QR Code: ${error.message}`);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(+id, updateAssetDto);
  }

  @Put(':id')
  async updateFull(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(+id, updateAssetDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const asset = await this.assetsService.findOne(+id);
      
      if (asset.file_qrcode) {
        try {
          const qrCodePath = path.join(process.cwd(), asset.file_qrcode);
          await fs.unlink(qrCodePath);
        } catch (error) {
          console.error('Gagal menghapus QR Code:', error);
        }
      }
      
      return this.assetsService.remove(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Gagal menghapus aset: ${error.message}`);
    }
  }

  // TAMBAHKAN 3 API BARU UNTUK FITUR LAPORAN DI BAWAH INI
  
  // Endpoint untuk mendapatkan semua gedung
  @Get('gedung')
  async findAllGedung() {
    try {
      const gedungList = await this.assetsService.findAllGedung();
      return {
        success: true,
        message: 'Berhasil mendapatkan data gedung',
        data: gedungList
      };
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data gedung: ${error.message}`);
    }
  }

  // Endpoint untuk mendapatkan unit kerja berdasarkan gedung
  @Get('unit-kerja/by-gedung/:id_gedung')
  async findUnitKerjaByGedung(@Param('id_gedung', ParseIntPipe) id_gedung: number) {
    try {
      const unitKerjaList = await this.assetsService.findUnitKerjaByGedung(id_gedung);
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
      const lokasiList = await this.assetsService.findLokasiByGedungAndUnit(gedungId, unitKerjaId);
      return {
        success: true,
        message: `Berhasil mendapatkan data lokasi untuk gedung ID ${gedungId} dan unit kerja ID ${unitKerjaId}`,
        data: lokasiList
      };
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data lokasi: ${error.message}`);
    }
  }
  // Tambahkan endpoint ini di dalam AssetsController class

@Get('by-location/:id_lokasi')
async findByLocation(@Param('id_lokasi', ParseIntPipe) id_lokasi: number) {
  try {
    const assets = await this.assetsService.findAllByLocation(id_lokasi);
    return {
      success: true,
      message: `Berhasil mendapatkan data aset untuk lokasi ID ${id_lokasi}`,
      data: assets
    };
  } catch (error) {
    throw new BadRequestException(`Gagal mendapatkan data aset: ${error.message}`);
  }
}
}