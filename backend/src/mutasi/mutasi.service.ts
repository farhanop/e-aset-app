// src/mutasi/mutasi.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mutasi } from './entities/mutasi.entity';
import { CreateMutasiDto } from './dto/create-mutasi.dto';
import { UpdateMutasiDto } from './dto/update-mutasi.dto';

@Injectable()
export class MutasiService {
  constructor(
    @InjectRepository(Mutasi)
    private mutasiRepository: Repository<Mutasi>,
  ) {}

  create(createMutasiDto: CreateMutasiDto): Promise<Mutasi> {
    const mutasi = this.mutasiRepository.create(createMutasiDto);
    return this.mutasiRepository.save(mutasi);
  }

  findAll(): Promise<Mutasi[]> {
    return this.mutasiRepository.find({
      relations: ['aset'],
    });
  }

  async findOne(id: number): Promise<Mutasi> {
    const mutasi = await this.mutasiRepository.findOne({
      where: { id_mutasi: id },
      relations: ['aset'],
    });

    if (!mutasi) {
      throw new NotFoundException(`Mutasi dengan ID ${id} tidak ditemukan`);
    }

    return mutasi;
  }

  findByAsset(id_aset: number): Promise<Mutasi[]> {
    return this.mutasiRepository.find({
      where: { id_aset },
      relations: ['aset'],
    });
  }

  async update(id: number, updateMutasiDto: UpdateMutasiDto): Promise<Mutasi> {
    await this.mutasiRepository.update(id, updateMutasiDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const mutasi = await this.findOne(id);
    await this.mutasiRepository.remove(mutasi);
  }
}
