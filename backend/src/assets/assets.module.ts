// src/assets/assets.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset } from '../entities/asset.entity';
import { MasterItem } from '../entities/master-item.entity';
import { Lokasi } from '../entities/lokasi.entity';
import { UnitKerja } from '../entities/unit-kerja.entity';
import { Gedung } from '../entities/gedung.entity';
import { Kampus } from 'src/entities/kampus.entity';
import { UnitUtama } from 'src/entities/unit-utama.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, MasterItem, Lokasi, UnitKerja, Gedung, Kampus, UnitUtama]), // Tambahkan Gedung
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}