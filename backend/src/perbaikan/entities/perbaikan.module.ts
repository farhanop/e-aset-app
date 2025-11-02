// src/modules/perbaikan/perbaikan.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerbaikanService } from './perbaikan.service';
import { PerbaikanController } from './perbaikan.controller';
import { Perbaikan } from '../entities/perbaikan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perbaikan])],
  controllers: [PerbaikanController],
  providers: [PerbaikanService],
  exports: [PerbaikanService],
})
export class PerbaikanModule {}
