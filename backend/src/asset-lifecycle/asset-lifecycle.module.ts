// backend\src\asset-lifecycle\asset-lifecycle.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetLifecycleService } from './asset-lifecycle.service';
import { AssetLifecycleController } from './asset-lifecycle.controller';

// Impor semua entity yang digunakan oleh service
import { Asset } from '../entities/asset.entity';
import { PeminjamanBarang } from '../entities/peminjaman-barang.entity';
import { PengembalianBarang } from '../entities/pengembalian-barang.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, PeminjamanBarang, PengembalianBarang]),
  ],
  controllers: [AssetLifecycleController],
  providers: [AssetLifecycleService],
})
export class AssetLifecycleModule {}
