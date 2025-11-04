// src/assets/assets.module.ts
import { Module, forwardRef } from '@nestjs/common'; // 1. Impor forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset } from '../entities/asset.entity';
// 2. Impor MasterDataModule
import { MasterDataModule } from 'src/master-data/master-data.module';

@Module({
  imports: [
    // 3. Daftarkan HANYA entitas 'Asset' di modul ini
    TypeOrmModule.forFeature([Asset]),

    // 4. Impor MasterDataModule di sini (di luar forFeature)
    // Gunakan forwardRef untuk mencegah circular dependency
    forwardRef(() => MasterDataModule),
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  // 5. Ekspor TypeOrmModule agar modul lain bisa 'melihat' entitas Asset
  exports: [AssetsService, TypeOrmModule],
})
export class AssetsModule {}
