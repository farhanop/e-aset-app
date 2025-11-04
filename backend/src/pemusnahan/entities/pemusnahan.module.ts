// src/modules/pemusnahan/pemusnahan.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PemusnahanService } from './pemusnahan.service';
import { PemusnahanController } from './pemusnahan.controller';
import { Pemusnahan } from '../entities/pemusnahan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pemusnahan])],
  controllers: [PemusnahanController],
  providers: [PemusnahanService],
  exports: [PemusnahanService],
})
export class PemusnahanModule {}
