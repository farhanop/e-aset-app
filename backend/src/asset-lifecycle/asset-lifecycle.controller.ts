// src/asset-lifecycle/asset-lifecycle.controller.ts
import { Controller, Post, Body, Param, UseGuards, Request, ParseIntPipe, Get } from '@nestjs/common';
import { AssetLifecycleService } from './asset-lifecycle.service';
import { CreatePeminjamanDto } from './dto/create-peminjaman.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('asset-lifecycle')
@UseGuards(JwtAuthGuard)
export class AssetLifecycleController {
  constructor(private readonly lifecycleService: AssetLifecycleService) {}

  @Post('pinjam')
  pinjam(@Body() dto: CreatePeminjamanDto, @Request() req) {
    return this.lifecycleService.pinjam(dto, req.user);
  }

  @Post('kembalikan/:id_peminjaman')
  kembalikan(@Param('id_peminjaman', ParseIntPipe) id: number, @Request() req) {
    return this.lifecycleService.kembalikan(id, req.user);
  }
  
  @Post('history/:id_aset')
  findPeminjamanHistory(@Param('id_aset', ParseIntPipe) id_aset: number) {
    return this.lifecycleService.findPeminjamanHistory(id_aset);
  }
  @Get('history/:id_aset')
  getPeminjamanHistory(@Param('id_aset', ParseIntPipe) id_aset: number) {
    return this.lifecycleService.findPeminjamanHistory(id_aset);
  }
}