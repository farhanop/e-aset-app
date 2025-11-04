// backend\src\asset-lifecycle\asset-lifecycle.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { AssetLifecycleService } from './asset-lifecycle.service';
import { CreatePeminjamanDto } from './dto/create-peminjaman.dto';
import { PengembalianDto } from './dto/pengembalian.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('asset-lifecycle')
@UseGuards(JwtAuthGuard)
export class AssetLifecycleController {
  constructor(private readonly lifecycleService: AssetLifecycleService) {}

  /** =============== PEMINJAMAN =============== */
  @Post('pinjam')
  async pinjam(@Body() dto: CreatePeminjamanDto, @Request() req) {
    return this.lifecycleService.pinjam(dto, req.user);
  }

  /** =============== PENGEMBALIAN =============== */
  @Post('kembalikan/:id_peminjaman')
  async kembalikan(
    @Param('id_peminjaman', ParseIntPipe) id_peminjaman: number,
    @Request() req,
    @Body() pengembalianDto: PengembalianDto,
  ) {
    try {
      console.log('Mengembalikan aset:', { id_peminjaman, pengembalianDto });
      const result = await this.lifecycleService.kembalikan(
        id_peminjaman,
        req.user,
        pengembalianDto,
      );
      console.log('Pengembalian berhasil:', result);
      return result;
    } catch (error) {
      console.error('Error saat mengembalikan aset:', error);
      throw error;
    }
  }

  /** =============== DAFTAR PEMINJAMAN AKTIF =============== */
  @Get('peminjaman-aktif')
  async getPeminjamanAktif(@Request() req) {
    // Error TS2554 (Missing Argument) diperbaiki di sini
    return this.lifecycleService.getPeminjamanAktif(req.user);
  }

  /** =============== RIWAYAT PEMINJAMAN BERDASARKAN ID ASET =============== */
  @Get('history/:id_aset')
  async getPeminjamanHistory(@Param('id_aset', ParseIntPipe) id_aset: number) {
    return this.lifecycleService.findPeminjamanHistory(id_aset);
  }

  /** =============== CEK PEMINJAMAN TERLAMBAT =============== */
  @Post('check-overdue')
  async checkOverdueLoans() {
    return this.lifecycleService.checkOverdueLoans();
  }

  /** =============== GET ALL ASSETS =============== */
  @Get('assets')
  async getAllAssets() {
    return this.lifecycleService.getAllAssets();
  }
}
