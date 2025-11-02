// src/perbaikan/perbaikan.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perbaikan } from '../entities/perbaikan.entity';
import { CreatePerbaikanDto } from './dto/create-perbaikan.dto';
import { UpdatePerbaikanDto } from './dto/update-perbaikan.dto';
import { PerbaikanStatus } from '../entities/perbaikan.entity';

@Injectable()
export class PerbaikanService {
  constructor(
    @InjectRepository(Perbaikan)
    private perbaikanRepository: Repository<Perbaikan>,
  ) {}

  create(createPerbaikanDto: CreatePerbaikanDto): Promise<Perbaikan> {
    const perbaikan = this.perbaikanRepository.create(createPerbaikanDto);
    return this.perbaikanRepository.save(perbaikan);
  }

  findAll(): Promise<Perbaikan[]> {
    return this.perbaikanRepository.find({
      relations: ['aset'],
    });
  }

  async findOne(id: number): Promise<Perbaikan> {
    const perbaikan = await this.perbaikanRepository.findOne({
      where: { id_perbaikan: id },
      relations: ['aset'],
    });

    if (!perbaikan) {
      throw new NotFoundException(`Perbaikan dengan ID ${id} tidak ditemukan`);
    }

    return perbaikan;
  }

  findByAsset(id_aset: number): Promise<Perbaikan[]> {
    return this.perbaikanRepository.find({
      where: { id_aset },
      relations: ['aset'],
    });
  }

  async update(
    id: number,
    updatePerbaikanDto: UpdatePerbaikanDto,
  ): Promise<Perbaikan> {
    await this.perbaikanRepository.update(id, updatePerbaikanDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const perbaikan = await this.findOne(id);
    await this.perbaikanRepository.remove(perbaikan);
  }

  async updateStatus(id: number, status: string): Promise<Perbaikan> {
    // Perbaikan: Mengubah string menjadi enum PerbaikanStatus
    await this.perbaikanRepository.update(id, {
      status_perbaikan: status as PerbaikanStatus,
    });
    return this.findOne(id);
  }
}
