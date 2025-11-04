// backend\src\asset-lifecycle\asset-lifecycle.service.ts
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

  /** ================= PEMINJAMAN ================= */
  async pinjam(
    dto: CreatePeminjamanDto,
    petugas: User,
  ): Promise<PeminjamanBarang> {
    try {
      return await this.connection.transaction(async (manager) => {
        const asset = await manager.findOne(Asset, {
          where: { id_aset: dto.id_aset },
          relations: ['item', 'lokasi', 'unitKerja'],
        });

        if (!asset) throw new NotFoundException('Aset tidak ditemukan');
        if (asset.status_aset !== 'Tersedia')
          throw new BadRequestException(
            `Aset sedang ${asset.status_aset}, tidak bisa dipinjam.`,
          );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dto.tgl_rencana_kembali <= today)
          throw new BadRequestException(
            'Tanggal rencana kembali harus lebih dari hari ini',
          );

        // Update status aset
        asset.status_aset = 'Dipinjam';
        await manager.save(Asset, asset);

        // Buat entitas peminjaman
        const peminjaman = manager.create(PeminjamanBarang, {
          ...dto,
          id_petugas_pinjam: petugas.id_user,
          tgl_pinjam: new Date(),
          status_peminjaman: 'Dipinjam',
        });

        return manager.save(PeminjamanBarang, peminjaman);
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        'Gagal melakukan peminjaman: ' + error.message,
      );
    }
  }

  /** ================= PENGEMBALIAN ================= */
  // Method ini (kembalikan) memperbaiki error TS2339 (Property does not exist)
  async kembalikan(
    id_peminjaman: number,
    petugas: User,
    pengembalianDto: PengembalianDto,
  ): Promise<Asset> {
    try {
      return await this.connection.transaction(async (manager) => {
        const peminjaman = await manager.findOne(PeminjamanBarang, {
          where: { id_peminjaman },
          relations: ['asset', 'asset.item', 'asset.lokasi', 'asset.unitKerja'],
        });

        if (!peminjaman)
          throw new NotFoundException('Data peminjaman tidak ditemukan');
        if (peminjaman.status_peminjaman === 'Dikembalikan')
          throw new BadRequestException('Aset sudah dikembalikan sebelumnya');

        // Update status peminjaman
        peminjaman.status_peminjaman = 'Dikembalikan';
        await manager.save(PeminjamanBarang, peminjaman);

        // Buat entitas pengembalian
        const pengembalian = manager.create(PengembalianBarang, {
          id_peminjaman,
          id_petugas_kembali: petugas.id_user,
          tgl_aktual_kembali: pengembalianDto.tgl_aktual_kembali || new Date(),
          kondisi_kembali: pengembalianDto.kondisi_kembali,
          keterangan_pengembalian: pengembalianDto.keterangan_pengembalian,
        });
        await manager.save(PengembalianBarang, pengembalian);

        // Update status aset berdasarkan kondisi pengembalian
        if (pengembalianDto.kondisi_kembali === 'Rusak Berat') {
          peminjaman.asset.status_aset = 'Rusak';
        } else if (pengembalianDto.kondisi_kembali === 'Rusak Ringan') {
          peminjaman.asset.status_aset = 'Maintenance';
        } else {
          peminjaman.asset.status_aset = 'Tersedia';
        }

        // Simpan perubahan status aset
        return manager.save(Asset, peminjaman.asset);
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      console.error('Error detail:', error); // Log untuk debugging
      throw new InternalServerErrorException(
        'Gagal mengembalikan aset: ' + error.message,
      );
    }
  }

  /** ================= PEMINJAMAN AKTIF ================= */
  // Method ini (getPeminjamanAktif) sekarang menerima 'user'
  async getPeminjamanAktif(user: User): Promise<PeminjamanBarang[]> {
    try {
      return this.peminjamanRepo.find({
        where: { status_peminjaman: 'Dipinjam' },
        relations: [
          'asset',
          'asset.item',
          'asset.lokasi',
          'asset.unitKerja',
          'petugasPinjam', // Menampilkan siapa yang meminjamkan
        ],
        order: { tgl_pinjam: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal mengambil daftar peminjaman aktif: ' + error.message,
      );
    }
  }

  /** ================= RIWAYAT PEMINJAMAN ================= */
  async findPeminjamanHistory(id_aset: number): Promise<PeminjamanBarang[]> {
    try {
      return this.peminjamanRepo.find({
        where: { id_aset },
        relations: [
          'petugasPinjam',
          'pengembalian', // Memuat data pengembalian terkait
          'pengembalian.petugasKembali', // Memuat petugas yang menerima pengembalian
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

  /** ================= CEK PEMINJAMAN TERLAMBAT ================= */
  async checkOverdueLoans(): Promise<PeminjamanBarang[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set ke awal hari

      const overdueLoans = await this.peminjamanRepo.find({
        where: {
          status_peminjaman: 'Dipinjam',
          tgl_rencana_kembali: LessThan(today), // Tanggal rencana < hari ini
        },
        relations: ['asset', 'asset.item', 'asset.lokasi', 'asset.unitKerja'],
      });

      // Jika ada yang terlambat, update statusnya dalam satu transaksi
      if (overdueLoans.length > 0) {
        await this.connection.transaction(async (manager) => {
          for (const loan of overdueLoans) {
            loan.status_peminjaman = 'Terlambat';
            await manager.save(PeminjamanBarang, loan);
          }
        });
      }

      return overdueLoans; // Mengembalikan daftar yang baru saja diupdate
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal memeriksa peminjaman terlambat: ' + error.message,
      );
    }
  }

  /** ================= GET ALL ASSETS ================= */
  async getAllAssets(): Promise<Asset[]> {
    try {
      return this.assetRepository.find({
        relations: ['item', 'lokasi', 'unitKerja'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal mengambil daftar aset: ' + error.message,
      );
    }
  }
}
