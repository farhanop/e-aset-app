// src/modules/mutasi/mutasi.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Mutasi } from './entities/mutasi.entity';
import { CreateMutasiDto } from './dto/create-mutasi.dto';
import { UpdateMutasiDto } from './dto/update-mutasi.dto';
import { Asset } from '../entities/asset.entity';
import { User } from '../users/user.entity'; // <-- Impor User

@Injectable()
export class MutasiService {
  constructor(
    @InjectRepository(Mutasi)
    private mutasiRepository: Repository<Mutasi>,
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    private connection: Connection,
  ) {}

  // 2. Ubah metode create untuk menerima 'petugas'
  async create(
    createMutasiDto: CreateMutasiDto,
    petugas: User, // <-- Menerima data user yang login
  ): Promise<Mutasi> {
    try {
      return await this.connection.transaction(async (manager) => {
        const { id_aset, id_lokasi_baru, id_unit_kerja_baru, tgl_mutasi } =
          createMutasiDto;

        // A. Temukan aset yang akan dimutasi
        const asset = await manager.findOne(Asset, {
          where: { id_aset },
        });

        if (!asset) {
          throw new NotFoundException('Aset tidak ditemukan');
        }

        // Simpan lokasi lama sebelum diubah
        const id_lokasi_lama = asset.id_lokasi;
        // HAPUS: const id_unit_kerja_lama = asset.id_unit_kerja;

        // Validasi: jangan mutasi ke lokasi yang sama
        if (id_lokasi_lama === id_lokasi_baru) {
          throw new BadRequestException('Aset sudah berada di lokasi tersebut');
        }

        // B. Update data di tbl_aset
        asset.id_lokasi = id_lokasi_baru;
        if (id_unit_kerja_baru) {
          asset.id_unit_kerja = id_unit_kerja_baru;
        }
        await manager.save(Asset, asset);

        // C. Buat catatan riwayat di tbl_mutasi_aset
        const mutasi = manager.create(Mutasi, {
          ...createMutasiDto,
          id_lokasi_lama, // <-- Ambil dari data aset sebelumnya
          id_petugas: petugas.id_user, // <-- Ambil dari user yang login
          tgl_mutasi: tgl_mutasi || new Date(),
          // HAPUS: id_unit_kerja_lama (tidak ada di tabel tbl_mutasi_aset)
        });

        return manager.save(Mutasi, mutasi);
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Gagal membuat mutasi: ' + error.message,
      );
    }
  }

  findAll(): Promise<Mutasi[]> {
    return this.mutasiRepository.find({
      relations: [
        'aset',
        'aset.item',
        'lokasiLama',
        'lokasiBaru',
        'petugas',
        // HAPUS: 'unitKerjaLama', 'unitKerjaBaru' (tidak ada di entity)
      ],
      order: { tgl_mutasi: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Mutasi> {
    const mutasi = await this.mutasiRepository.findOne({
      where: { id_mutasi: id },
      relations: [
        'aset',
        'aset.item',
        'lokasiLama',
        'lokasiBaru',
        'petugas',
        // HAPUS: 'unitKerjaLama', 'unitKerjaBaru'
      ],
    });

    if (!mutasi) {
      throw new NotFoundException(`Mutasi dengan ID ${id} tidak ditemukan`);
    }

    return mutasi;
  }

  findByAsset(id_aset: number): Promise<Mutasi[]> {
    return this.mutasiRepository.find({
      where: { id_aset },
      relations: [
        'lokasiLama',
        'lokasiBaru',
        'petugas',
        // HAPUS: 'unitKerjaLama', 'unitKerjaBaru'
      ],
      order: { tgl_mutasi: 'DESC' },
    });
  }

  async update(id: number, updateMutasiDto: UpdateMutasiDto): Promise<Mutasi> {
    // Peringatan: Update ini hanya mengubah catatan, tidak membatalkan mutasi fisik.
    await this.mutasiRepository.update(id, updateMutasiDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Peringatan: Remove ini hanya menghapus catatan, tidak membatalkan mutasi fisik.
    const mutasi = await this.findOne(id);
    await this.mutasiRepository.remove(mutasi);
  }
}
