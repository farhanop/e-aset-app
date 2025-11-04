// src/master-data/master-data.module.ts
import { Module, forwardRef } from '@nestjs/common'; // 1. Impor forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';

// 2. Impor SEMUA entitas master data
import { Kampus } from '../entities/kampus.entity';
import { Gedung } from '../entities/gedung.entity';
import { Lokasi } from '../entities/lokasi.entity';
import { UnitKerja } from '../entities/unit-kerja.entity';
import { UnitUtama } from '../entities/unit-utama.entity';
import { KategoriItem } from '../entities/kategori-item.entity';
import { MasterItem } from '../entities/master-item.entity';
import { AssetGroup } from '../entities/asset-group.entity'; // <-- 3. Impor AssetGroup
import { AssetsModule } from 'src/assets/assets.module'; // 4. Impor AssetsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 5. Daftarkan SEMUA entitas master data di sini
      Kampus,
      Gedung,
      Lokasi,
      UnitKerja,
      UnitUtama,
      KategoriItem,
      MasterItem,
      AssetGroup, // <-- 6. Daftarkan AssetGroup yang hilang
    ]),
    // 7. Impor AssetsModule dengan forwardRef
    forwardRef(() => AssetsModule),
  ],
  controllers: [MasterDataController],
  providers: [MasterDataService],
  // 8. Ekspor TypeOrmModule agar AssetsModule bisa 'melihat' entitas master
  exports: [TypeOrmModule],
})
export class MasterDataModule {}
