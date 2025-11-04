// src/pemusnahan/pemusnahan.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pemusnahan } from '../entities/pemusnahan.entity';
import { CreatePemusnahanDto } from './dto/create-pemusnahan.dto';
import { UpdatePemusnahanDto } from './dto/update-pemusnahan.dto';

@Injectable()
export class PemusnahanService {
  constructor(
    @InjectRepository(Pemusnahan)
    private pemusnahanRepository: Repository<Pemusnahan>,
  ) {}

  create(createPemusnahanDto: CreatePemusnahanDto): Promise<Pemusnahan> {
    const pemusnahan = this.pemusnahanRepository.create(createPemusnahanDto);
    return this.pemusnahanRepository.save(pemusnahan);
  }

  findAll(): Promise<Pemusnahan[]> {
    return this.pemusnahanRepository.find({
      relations: ['aset'],
    });
  }

  async findOne(id: number): Promise<Pemusnahan> {
    const pemusnahan = await this.pemusnahanRepository.findOne({
      where: { id_pemusnahan: id },
      relations: ['aset'],
    });

    if (!pemusnahan) {
      throw new NotFoundException(`Pemusnahan dengan ID ${id} tidak ditemukan`);
    }

    return pemusnahan;
  }

  findByAsset(id_aset: number): Promise<Pemusnahan[]> {
    return this.pemusnahanRepository.find({
      where: { id_aset },
      relations: ['aset'],
    });
  }

  async update(
    id: number,
    updatePemusnahanDto: UpdatePemusnahanDto,
  ): Promise<Pemusnahan> {
    await this.pemusnahanRepository.update(id, updatePemusnahanDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const pemusnahan = await this.findOne(id);
    await this.pemusnahanRepository.remove(pemusnahan);
  }
}
