// src/modules/mutasi/mutasi.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MutasiService } from './mutasi.service';
import { MutasiController } from './mutasi.controller';
import { Mutasi } from './entities/mutasi.entity';
import { Asset } from '../entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mutasi, Asset])],
  controllers: [MutasiController],
  providers: [MutasiService],
  exports: [MutasiService],
})
export class MutasiModule {}
