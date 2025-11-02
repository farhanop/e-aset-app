// src/asset-lifecycle/asset-lifecycle.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, LessThan } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { PeminjamanBarang } from '../entities/peminjaman-barang.entity';
import { PengembalianBarang } from '../entities/pengembalian-barang.entity';
import { CreatePeminjamanDto } from './dto/create-peminjaman.dto';
import { PengembalianDto } from './dto/pengembalian.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AssetLifecycleService {
  constructor(
    @InjectRepository(Asset) private assetRepository: Repository<Asset>,
    @InjectRepository(PeminjamanBarang)
    private peminjamanRepo: Repository<PeminjamanBarang>,
    @InjectRepository(PengembalianBarang)
    private pengembalianRepo: Repository<PengembalianBarang>,
    private connection: Connection,
  ) {}

  async pinjam(
    dto: CreatePeminjamanDto,
    petugas: User,
  ): Promise<PeminjamanBarang> {
    try {
      return await this.connection.transaction(
        async (transactionalEntityManager) => {
          // Cek aset
          const asset = await transactionalEntityManager.findOne(Asset, {
            where: { id_aset: dto.id_aset },
            relations: ['item', 'lokasi', 'unitKerja'],
          });

          if (!asset) throw new NotFoundException('Aset tidak ditemukan');
          if (asset.status_aset !== 'Tersedia') {
            throw new BadRequestException(
              `Aset sedang ${asset.status_aset}, tidak bisa dipinjam.`,
            );
          }

          // Validasi tanggal
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (dto.tgl_rencana_kembali <= today) {
            throw new BadRequestException(
              'Tanggal rencana kembali harus lebih dari hari ini',
            );
          }

          // Update status aset
          asset.status_aset = 'Dipinjam';
          await transactionalEntityManager.save(Asset, asset);

          // Buat catatan peminjaman
          const peminjaman = transactionalEntityManager.create(
            PeminjamanBarang,
            {
              ...dto,
              id_petugas_pinjam: petugas.id_user,
              tgl_pinjam: new Date(),
            },
          );

          return transactionalEntityManager.save(PeminjamanBarang, peminjaman);
        },
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Gagal melakukan peminjaman: ' + error.message,
      );
    }
  }

  async kembalikan(
    id_peminjaman: number,
    petugas: User,
    tgl_aktual_kembali?: Date,
  ): Promise<Asset> {
    try {
      return await this.connection.transaction(
        async (transactionalEntityManager) => {
          // Cek peminjaman
          const peminjaman = await transactionalEntityManager.findOne(
            PeminjamanBarang,
            {
              where: { id_peminjaman },
              relations: [
                'asset',
                'asset.item',
                'asset.lokasi',
                'asset.unitKerja',
              ],
            },
          );

          if (!peminjaman)
            throw new NotFoundException('Data peminjaman tidak ditemukan');
          if (peminjaman.status_peminjaman === 'Dikembalikan') {
            throw new BadRequestException('Aset sudah dikembalikan sebelumnya');
          }

          // Update status peminjaman
          peminjaman.status_peminjaman = 'Dikembalikan';
          await transactionalEntityManager.save(PeminjamanBarang, peminjaman);

          // Buat catatan pengembalian
          const pengembalian = transactionalEntityManager.create(
            PengembalianBarang,
            {
              id_peminjaman,
              id_petugas_kembali: petugas.id_user,
              tgl_aktual_kembali: tgl_aktual_kembali || new Date(),
            },
          );
          await transactionalEntityManager.save(
            PengembalianBarang,
            pengembalian,
          );

          // Update status aset
          peminjaman.asset.status_aset = 'Tersedia';
          return transactionalEntityManager.save(Asset, peminjaman.asset);
        },
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Gagal mengembalikan aset: ' + error.message,
      );
    }
  }

  async findPeminjamanHistory(id_aset: number): Promise<PeminjamanBarang[]> {
    try {
      return this.peminjamanRepo.find({
        where: { id_aset },
        relations: [
          'petugasPinjam',
          'pengembalian',
          'pengembalian.petugasKembali',
          'asset',
          'asset.item',
          'asset.lokasi',
          'asset.unitKerja',
        ],
        order: { tgl_pinjam: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal mengambil riwayat peminjaman: ' + error.message,
      );
    }
  }

  async checkOverdueLoans(): Promise<PeminjamanBarang[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Cari peminjaman yang masih aktif dan melewati tanggal kembali
      const overdueLoans = await this.peminjamanRepo.find({
        where: {
          status_peminjaman: 'Dipinjam',
          tgl_rencana_kembali: LessThan(today),
        },
        relations: ['asset', 'asset.item', 'asset.lokasi', 'asset.unitKerja'],
      });

      // Update status menjadi terlambat
      if (overdueLoans.length > 0) {
        await this.connection.transaction(
          async (transactionalEntityManager) => {
            for (const loan of overdueLoans) {
              loan.status_peminjaman = 'Terlambat';
              await transactionalEntityManager.save(PeminjamanBarang, loan);
            }
          },
        );
      }

      return overdueLoans;
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal memeriksa peminjaman terlambat: ' + error.message,
      );
    }
  }
}
