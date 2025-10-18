// src/master-data/master-data.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDataService } from './master-data.service';
import { MasterDataController } from './master-data.controller';
import { UnitUtama } from '../entities/unit-utama.entity';
import { UnitKerja } from '../entities/unit-kerja.entity';
import { Gedung } from '../entities/gedung.entity';
import { Lokasi } from '../entities/lokasi.entity';
import { KategoriItem } from '../entities/kategori-item.entity';
import { MasterItem } from '../entities/master-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UnitUtama,
      UnitKerja,
      Gedung,
      Lokasi,
      KategoriItem,
      MasterItem,
    ]),
  ],
  controllers: [MasterDataController],
  providers: [MasterDataService],
  exports: [MasterDataService], 
})
export class MasterDataModule {}