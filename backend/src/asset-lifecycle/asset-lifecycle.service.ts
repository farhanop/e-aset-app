// src/asset-lifecycle/asset-lifecycle.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { PeminjamanBarang } from '../entities/peminjaman-barang.entity';
import { PengembalianBarang } from '../entities/pengembalian-barang.entity';
import { CreatePeminjamanDto } from './dto/create-peminjaman.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AssetLifecycleService {
  constructor(
    @InjectRepository(Asset) private assetRepository: Repository<Asset>,
    @InjectRepository(PeminjamanBarang) private peminjamanRepo: Repository<PeminjamanBarang>,
    @InjectRepository(PengembalianBarang) private pengembalianRepo: Repository<PengembalianBarang>,
  ) {}

  async pinjam(dto: CreatePeminjamanDto, petugas: User): Promise<PeminjamanBarang> {
    const asset = await this.assetRepository.findOneBy({ id_aset: dto.id_aset });
    if (!asset) throw new NotFoundException('Aset tidak ditemukan');
    if (asset.status_aset !== 'Tersedia') {
      throw new BadRequestException(`Aset sedang ${asset.status_aset}, tidak bisa dipinjam.`);
    }

    // 1. Update status aset menjadi 'Dipinjam'
    asset.status_aset = 'Dipinjam';
    await this.assetRepository.save(asset);

    // 2. Buat catatan peminjaman baru
    const peminjaman = this.peminjamanRepo.create({
      ...dto,
      id_petugas_pinjam: petugas.id_user,
      tgl_pinjam: new Date(),
    });

    return this.peminjamanRepo.save(peminjaman);
  }

  async kembalikan(id_peminjaman: number, petugas: User): Promise<Asset> {
    const peminjaman = await this.peminjamanRepo.findOneBy({ id_peminjaman });
    if (!peminjaman) throw new NotFoundException('Data peminjaman tidak ditemukan');

    const asset = await this.assetRepository.findOneBy({ id_aset: peminjaman.id_aset });
    if (!asset) throw new NotFoundException('Aset terkait tidak ditemukan');

    // 1. Update status peminjaman menjadi 'Dikembalikan'
    peminjaman.status_peminjaman = 'Dikembalikan';
    await this.peminjamanRepo.save(peminjaman);

    // 2. Buat catatan pengembalian
    const pengembalian = this.pengembalianRepo.create({
      id_peminjaman,
      id_petugas_kembali: petugas.id_user,
      tgl_aktual_kembali: new Date(),
    });
    await this.pengembalianRepo.save(pengembalian);

    // 3. Update status aset kembali menjadi 'Tersedia'
    asset.status_aset = 'Tersedia';
    return this.assetRepository.save(asset);
  }
  async findPeminjamanHistory(id_aset: number): Promise<PeminjamanBarang[]> {
    return this.peminjamanRepo.find({
      where: { id_aset },
      relations: ['petugasPinjam', 'pengembalian', 'pengembalian.petugasKembali'],
      order: { tgl_pinjam: 'DESC' },
    });
  }
}