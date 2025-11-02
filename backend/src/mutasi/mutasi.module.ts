// src/modules/mutasi/mutasi.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MutasiService } from './mutasi.service';
import { MutasiController } from './mutasi.controller';
import { Mutasi } from './entities/mutasi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mutasi])],
  controllers: [MutasiController],
  providers: [MutasiService],
  exports: [MutasiService],
})
export class MutasiModule {}
