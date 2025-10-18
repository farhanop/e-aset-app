// src/master-data/master-data.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitUtama } from '../entities/unit-utama.entity';
import { UnitKerja } from '../entities/unit-kerja.entity';
import { Gedung } from '../entities/gedung.entity';
import { Lokasi } from '../entities/lokasi.entity';
import { KategoriItem } from '../entities/kategori-item.entity';
import { MasterItem } from '../entities/master-item.entity';
import { CreateUnitUtamaDto } from './dto/create-unit-utama.dto';
import { UpdateUnitUtamaDto } from './dto/update-unit-utama.dto';
import { CreateUnitKerjaDto } from './dto/create-unit-kerja.dto';
import { UpdateUnitKerjaDto } from './dto/update-unit-kerja.dto';
import { CreateGedungDto } from './dto/create-gedung.dto';
import { UpdateGedungDto } from './dto/update-gedung.dto';
import { CreateLokasiDto } from './dto/create-lokasi.dto';
import { UpdateLokasiDto } from './dto/update-lokasi.dto';
import { CreateKategoriItemDto } from './dto/create-kategori-item.dto';
import { UpdateKategoriItemDto } from './dto/update-kategori-item.dto';
import { CreateMasterItemDto } from './dto/create-master-item.dto';
import { UpdateMasterItemDto } from './dto/update-master-item.dto';

@Injectable()
export class MasterDataService {
  constructor(
    @InjectRepository(UnitUtama) private unitUtamaRepository: Repository<UnitUtama>,
    @InjectRepository(UnitKerja) private unitKerjaRepository: Repository<UnitKerja>,
    @InjectRepository(Gedung) private gedungRepository: Repository<Gedung>,
    @InjectRepository(Lokasi) private lokasiRepository: Repository<Lokasi>,
    @InjectRepository(KategoriItem) private kategoriItemRepository: Repository<KategoriItem>,
    @InjectRepository(MasterItem) private masterItemRepository: Repository<MasterItem>,
  ) {}

  // === KODE YANG SUDAH ADA TETAP DI BAWAH INI ===
  
  // --- Metode untuk Unit Utama ---
  async findAllUnitUtama() {
    return this.unitUtamaRepository.find({
      order: { nama_unit_utama: 'ASC' }
    });
  }

  async createUnitUtama(data: CreateUnitUtamaDto) {
    // Cek apakah kode sudah ada
    const existing = await this.unitUtamaRepository.findOne({
      where: { kode_unit_utama: data.kode_unit_utama }
    });
    
    if (existing) {
      throw new BadRequestException('Kode unit utama sudah digunakan');
    }
    
    return this.unitUtamaRepository.save(this.unitUtamaRepository.create(data));
  }

  async updateUnitUtama(id: number, data: UpdateUnitUtamaDto) {
    const unitUtama = await this.unitUtamaRepository.findOneBy({ id_unit_utama: id });
    if (!unitUtama) {
      throw new NotFoundException('Unit Utama tidak ditemukan');
    }

    // Cek apakah kode sudah ada (kecuali untuk unit utama yang sama)
    if (data.kode_unit_utama && data.kode_unit_utama !== unitUtama.kode_unit_utama) {
      const existing = await this.unitUtamaRepository.findOne({
        where: { kode_unit_utama: data.kode_unit_utama }
      });
      
      if (existing) {
        throw new BadRequestException('Kode unit utama sudah digunakan');
      }
    }

    await this.unitUtamaRepository.update(id, data);
    return this.unitUtamaRepository.findOneBy({ id_unit_utama: id });
  }

  async removeUnitUtama(id: number) {
    const unitUtama = await this.unitUtamaRepository.findOneBy({ id_unit_utama: id });
    if (!unitUtama) {
      throw new NotFoundException('Unit Utama tidak ditemukan');
    }

    // Cek apakah ada unit kerja yang terkait
    const unitKerjaCount = await this.unitKerjaRepository.count({
      where: { id_unit_utama: id }
    });

    if (unitKerjaCount > 0) {
      throw new BadRequestException('Tidak dapat menghapus unit utama yang masih memiliki unit kerja terkait');
    }

    await this.unitUtamaRepository.delete(id);
    return { message: 'Unit Utama berhasil dihapus' };
  }

  // --- Metode untuk Unit Kerja ---
  async findAllUnitKerja() {
    return this.unitKerjaRepository.find({ 
      relations: ['unitUtama'],
      order: { nama_unit: 'ASC' }
    });
  }

  async createUnitKerja(data: CreateUnitKerjaDto) {
    // Cek apakah kode sudah ada
    const existing = await this.unitKerjaRepository.findOne({
      where: { kode_unit: data.kode_unit }
    });
    
    if (existing) {
      throw new BadRequestException('Kode unit kerja sudah digunakan');
    }

    // Cek apakah unit utama ada
    const unitUtama = await this.unitUtamaRepository.findOneBy({
      id_unit_utama: data.id_unit_utama
    });
    
    if (!unitUtama) {
      throw new BadRequestException('Unit utama tidak ditemukan');
    }
    
    return this.unitKerjaRepository.save(this.unitKerjaRepository.create(data));
  }

  async updateUnitKerja(id: number, data: UpdateUnitKerjaDto) {
    const unitKerja = await this.unitKerjaRepository.findOneBy({ id_unit_kerja: id });
    if (!unitKerja) {
      throw new NotFoundException('Unit Kerja tidak ditemukan');
    }

    // Cek apakah kode sudah ada (kecuali untuk unit kerja yang sama)
    if (data.kode_unit && data.kode_unit !== unitKerja.kode_unit) {
      const existing = await this.unitKerjaRepository.findOne({
        where: { kode_unit: data.kode_unit }
      });
      
      if (existing) {
        throw new BadRequestException('Kode unit kerja sudah digunakan');
      }
    }

    // Cek apakah unit utama ada jika diubah
    if (data.id_unit_utama && data.id_unit_utama !== unitKerja.id_unit_utama) {
      const unitUtama = await this.unitUtamaRepository.findOneBy({
        id_unit_utama: data.id_unit_utama
      });
      
      if (!unitUtama) {
        throw new BadRequestException('Unit utama tidak ditemukan');
      }
    }

    await this.unitKerjaRepository.update(id, data);
    return this.unitKerjaRepository.findOne({
      where: { id_unit_kerja: id },
      relations: ['unitUtama']
    });
  }

  async removeUnitKerja(id: number) {
    const unitKerja = await this.unitKerjaRepository.findOneBy({ id_unit_kerja: id });
    if (!unitKerja) {
      throw new NotFoundException('Unit Kerja tidak ditemukan');
    }

    // Cek apakah ada lokasi yang terkait
    const lokasiCount = await this.lokasiRepository.count({
      where: { id_unit_kerja: id }
    });

    if (lokasiCount > 0) {
      throw new BadRequestException('Tidak dapat menghapus unit kerja yang masih memiliki lokasi terkait');
    }

    await this.unitKerjaRepository.delete(id);
    return { message: 'Unit Kerja berhasil dihapus' };
  }

  // --- Metode untuk Gedung ---
  async findAllGedung() {
    return this.gedungRepository.find({
      order: { nama_gedung: 'ASC' }
    });
  }

  async createGedung(data: CreateGedungDto) {
    // Cek apakah kode sudah ada
    const existing = await this.gedungRepository.findOne({
      where: { kode_gedung: data.kode_gedung }
    });
    
    if (existing) {
      throw new BadRequestException('Kode gedung sudah digunakan');
    }
    
    return this.gedungRepository.save(this.gedungRepository.create(data));
  }

  async updateGedung(id: number, data: UpdateGedungDto) {
    const gedung = await this.gedungRepository.findOneBy({ id_gedung: id });
    if (!gedung) {
      throw new NotFoundException('Gedung tidak ditemukan');
    }

    // Cek apakah kode sudah ada (kecuali untuk gedung yang sama)
    if (data.kode_gedung && data.kode_gedung !== gedung.kode_gedung) {
      const existing = await this.gedungRepository.findOne({
        where: { kode_gedung: data.kode_gedung }
      });
      
      if (existing) {
        throw new BadRequestException('Kode gedung sudah digunakan');
      }
    }

    await this.gedungRepository.update(id, data);
    return this.gedungRepository.findOneBy({ id_gedung: id });
  }

  async removeGedung(id: number) {
    const gedung = await this.gedungRepository.findOneBy({ id_gedung: id });
    if (!gedung) {
      throw new NotFoundException('Gedung tidak ditemukan');
    }

    // Cek apakah ada lokasi yang terkait
    const lokasiCount = await this.lokasiRepository.count({
      where: { id_gedung: id }
    });

    if (lokasiCount > 0) {
      throw new BadRequestException('Tidak dapat menghapus gedung yang masih memiliki lokasi terkait');
    }

    await this.gedungRepository.delete(id);
    return { message: 'Gedung berhasil dihapus' };
  }

  // --- Metode untuk Lokasi ---
  async findAllLokasi() {
    return this.lokasiRepository.find({ 
      relations: ['gedung', 'unitKerja'],
      order: { nama_ruangan: 'ASC' }
    });
  }

  async createLokasi(data: CreateLokasiDto) {
    // Cek apakah kode sudah ada
    const existing = await this.lokasiRepository.findOne({
      where: { kode_ruangan: data.kode_ruangan }
    });
    
    if (existing) {
      throw new BadRequestException('Kode ruangan sudah digunakan');
    }

    // Cek apakah gedung ada
    const gedung = await this.gedungRepository.findOneBy({
      id_gedung: data.id_gedung
    });
    
    if (!gedung) {
      throw new BadRequestException('Gedung tidak ditemukan');
    }

    // Cek apakah unit kerja ada jika diisi
    if (data.id_unit_kerja) {
      const unitKerja = await this.unitKerjaRepository.findOneBy({
        id_unit_kerja: data.id_unit_kerja
      });
      
      if (!unitKerja) {
        throw new BadRequestException('Unit kerja tidak ditemukan');
      }
    }
    
    return this.lokasiRepository.save(this.lokasiRepository.create(data));
  }

  async updateLokasi(id: number, data: UpdateLokasiDto) {
    const lokasi = await this.lokasiRepository.findOneBy({ id_lokasi: id });
    if (!lokasi) {
      throw new NotFoundException('Lokasi tidak ditemukan');
    }

    // Cek apakah kode sudah ada (kecuali untuk lokasi yang sama)
    if (data.kode_ruangan && data.kode_ruangan !== lokasi.kode_ruangan) {
      const existing = await this.lokasiRepository.findOne({
        where: { kode_ruangan: data.kode_ruangan }
      });
      
      if (existing) {
        throw new BadRequestException('Kode ruangan sudah digunakan');
      }
    }

    // Cek apakah gedung ada jika diubah
    if (data.id_gedung && data.id_gedung !== lokasi.id_gedung) {
      const gedung = await this.gedungRepository.findOneBy({
        id_gedung: data.id_gedung
      });
      
      if (!gedung) {
        throw new BadRequestException('Gedung tidak ditemukan');
      }
    }

    // Cek apakah unit kerja ada jika diubah
    if (data.id_unit_kerja !== undefined) {
      if (data.id_unit_kerja) {
        const unitKerja = await this.unitKerjaRepository.findOneBy({
          id_unit_kerja: data.id_unit_kerja
        });
        
        if (!unitKerja) {
          throw new BadRequestException('Unit kerja tidak ditemukan');
        }
      }
    }

    await this.lokasiRepository.update(id, data);
    return this.lokasiRepository.findOne({
      where: { id_lokasi: id },
      relations: ['gedung', 'unitKerja']
    });
  }

  async removeLokasi(id: number) {
    const lokasi = await this.lokasiRepository.findOneBy({ id_lokasi: id });
    if (!lokasi) {
      throw new NotFoundException('Lokasi tidak ditemukan');
    }

    await this.lokasiRepository.delete(id);
    return { message: 'Lokasi berhasil dihapus' };
  }

  // --- Metode untuk Kategori Item ---
  async findAllKategoriItem() {
    return this.kategoriItemRepository.find({
      order: { nama_kategori: 'ASC' }
    });
  }

  async createKategoriItem(data: CreateKategoriItemDto) {
    // Cek apakah nama sudah ada
    const existing = await this.kategoriItemRepository.findOne({
      where: { nama_kategori: data.nama_kategori }
    });
    
    if (existing) {
      throw new BadRequestException('Nama kategori sudah digunakan');
    }
    
    return this.kategoriItemRepository.save(this.kategoriItemRepository.create(data));
  }

  async updateKategoriItem(id: number, data: UpdateKategoriItemDto) {
    const kategori = await this.kategoriItemRepository.findOneBy({ id_kategori: id });
    if (!kategori) {
      throw new NotFoundException('Kategori Item tidak ditemukan');
    }

    // Cek apakah nama sudah ada (kecuali untuk kategori yang sama)
    if (data.nama_kategori && data.nama_kategori !== kategori.nama_kategori) {
      const existing = await this.kategoriItemRepository.findOne({
        where: { nama_kategori: data.nama_kategori }
      });
      
      if (existing) {
        throw new BadRequestException('Nama kategori sudah digunakan');
      }
    }

    await this.kategoriItemRepository.update(id, data);
    return this.kategoriItemRepository.findOneBy({ id_kategori: id });
  }

  async removeKategoriItem(id: number) {
    const kategori = await this.kategoriItemRepository.findOneBy({ id_kategori: id });
    if (!kategori) {
      throw new NotFoundException('Kategori Item tidak ditemukan');
    }

    // Cek apakah ada master item yang terkait
    const itemCount = await this.masterItemRepository.count({
      where: { id_kategori: id }
    });

    if (itemCount > 0) {
      throw new BadRequestException('Tidak dapat menghapus kategori yang masih memiliki item terkait');
    }

    await this.kategoriItemRepository.delete(id);
    return { message: 'Kategori Item berhasil dihapus' };
  }

  // --- Metode untuk Master Item ---
  async findAllMasterItem() {
    return this.masterItemRepository.find({ 
      relations: ['kategori'],
      order: { nama_item: 'ASC' }
    });
  }

  async createMasterItem(data: CreateMasterItemDto) {
    // Cek apakah kode sudah ada
    const existing = await this.masterItemRepository.findOne({
      where: { kode_item: data.kode_item }
    });
    
    if (existing) {
      throw new BadRequestException('Kode item sudah digunakan');
    }

    // Cek apakah kategori ada
    const kategori = await this.kategoriItemRepository.findOneBy({
      id_kategori: data.id_kategori
    });
    
    if (!kategori) {
      throw new BadRequestException('Kategori item tidak ditemukan');
    }
    
    return this.masterItemRepository.save(this.masterItemRepository.create(data));
  }

  async updateMasterItem(id: number, data: UpdateMasterItemDto) {
    const item = await this.masterItemRepository.findOneBy({ id_item: id });
    if (!item) {
      throw new NotFoundException('Master Item tidak ditemukan');
    }

    // Cek apakah kode sudah ada (kecuali untuk item yang sama)
    if (data.kode_item && data.kode_item !== item.kode_item) {
      const existing = await this.masterItemRepository.findOne({
        where: { kode_item: data.kode_item }
      });
      
      if (existing) {
        throw new BadRequestException('Kode item sudah digunakan');
      }
    }

    // Cek apakah kategori ada jika diubah
    if (data.id_kategori && data.id_kategori !== item.id_kategori) {
      const kategori = await this.kategoriItemRepository.findOneBy({
        id_kategori: data.id_kategori
      });
      
      if (!kategori) {
        throw new BadRequestException('Kategori item tidak ditemukan');
      }
    }

    await this.masterItemRepository.update(id, data);
    return this.masterItemRepository.findOne({
      where: { id_item: id },
      relations: ['kategori']
    });
  }

  async removeMasterItem(id: number) {
    const item = await this.masterItemRepository.findOneBy({ id_item: id });
    if (!item) {
      throw new NotFoundException('Master Item tidak ditemukan');
    }

    await this.masterItemRepository.delete(id);
    return { message: 'Master Item berhasil dihapus' };
  }

  // TAMBAHKAN 2 METODE BARU UNTUK FITUR LAPORAN DI BAWAH INI
  
  /**
   * Metode untuk mendapatkan unit kerja berdasarkan gedung
   */
  async findUnitKerjaByGedung(id_gedung: number): Promise<UnitKerja[]> {
    // Cari lokasi di gedung tertentu dan dapatkan unit kerja yang unik
    const distinctUnitKerja = await this.lokasiRepository
      .createQueryBuilder('lokasi')
      .innerJoin('lokasi.unitKerja', 'unitKerja')
      .where('lokasi.id_gedung = :id_gedung', { id_gedung })
      .select(['unitKerja.id_unit_kerja', 'unitKerja.kode_unit', 'unitKerja.nama_unit', 'unitKerja.id_unit_utama'])
      .distinct(true)
      .getRawMany();

    return distinctUnitKerja.map(item => ({
      id_unit_kerja: item.unitKerja_id_unit_kerja,
      kode_unit: item.unitKerja_kode_unit,
      nama_unit: item.unitKerja_nama_unit,
      id_unit_utama: item.unitKerja_id_unit_utama
    })) as UnitKerja[];
  }

  /**
   * Metode untuk mendapatkan lokasi berdasarkan gedung dan unit kerja
   */
  async findLokasiByGedungAndUnit(gedungId: number, unitKerjaId: number): Promise<Lokasi[]> {
    return this.lokasiRepository.find({
      where: { 
        id_gedung: gedungId,
        id_unit_kerja: unitKerjaId
      },
      relations: ['gedung', 'unitKerja'],
      order: { nama_ruangan: 'ASC' }
    });
  }
}