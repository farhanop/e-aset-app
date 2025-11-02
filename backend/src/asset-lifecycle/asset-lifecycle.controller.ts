// src/asset-lifecycle/asset-lifecycle.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Get,
  Query,
} from '@nestjs/common';
import { AssetLifecycleService } from './asset-lifecycle.service';
import { CreatePeminjamanDto } from './dto/create-peminjaman.dto';
import { PengembalianDto } from './dto/pengembalian.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('asset-lifecycle')
@UseGuards(JwtAuthGuard)
export class AssetLifecycleController {
  constructor(private readonly lifecycleService: AssetLifecycleService) {}

  @Post('pinjam')
  async pinjam(@Body() dto: CreatePeminjamanDto, @Request() req) {
    return this.lifecycleService.pinjam(dto, req.user);
  }

  @Post('kembalikan/:id_peminjaman')
  async kembalikan(
    @Param('id_peminjaman', ParseIntPipe) id: number,
    @Request() req,
    @Body() pengembalianDto?: PengembalianDto,
  ) {
    const tgl_aktual_kembali = pengembalianDto?.tgl_aktual_kembali;
    return this.lifecycleService.kembalikan(id, req.user, tgl_aktual_kembali);
  }

  @Get('history/:id_aset')
  async getPeminjamanHistory(@Param('id_aset', ParseIntPipe) id_aset: number) {
    return this.lifecycleService.findPeminjamanHistory(id_aset);
  }

  @Post('check-overdue')
  async checkOverdueLoans() {
    return this.lifecycleService.checkOverdueLoans();
  }
}
