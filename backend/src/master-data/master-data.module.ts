import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';
import { Kampus } from '../entities/kampus.entity';
import { Gedung } from '../entities/gedung.entity';
import { Lokasi } from '../entities/lokasi.entity';
import { UnitKerja } from '../entities/unit-kerja.entity';
import { UnitUtama } from '../entities/unit-utama.entity';
import { KategoriItem } from '../entities/kategori-item.entity';
import { MasterItem } from '../entities/master-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Daftarkan semua entitas yang dikelola oleh modul ini
      Kampus,
      Gedung,
      Lokasi,
      UnitKerja,
      UnitUtama,
      KategoriItem,
      MasterItem,
    ]),
  ],
  controllers: [MasterDataController],
  providers: [MasterDataService],
})
export class MasterDataModule {}
