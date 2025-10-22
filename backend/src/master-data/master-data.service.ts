// src/master-data/master-data.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitUtama } from '../entities/unit-utama.entity';
import { UnitKerja } from '../entities/unit-kerja.entity';
import { Gedung } from '../entities/gedung.entity';
import { Kampus } from 'src/entities/kampus.entity';
import { Lokasi } from '../entities/lokasi.entity';
import { KategoriItem } from '../entities/kategori-item.entity';
import { MasterItem } from '../entities/master-item.entity';
import { CreateUnitUtamaDto } from './dto/create-unit-utama.dto';
import { UpdateUnitUtamaDto } from './dto/update-unit-utama.dto';
import { CreateUnitKerjaDto } from './dto/create-unit-kerja.dto';
import { UpdateUnitKerjaDto } from './dto/update-unit-kerja.dto';
import { CreateKampusDto } from './dto/create-kampus.dto';
import { UpdateKampusDto } from './dto/update-kampus.dto';
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
    @InjectRepository(Kampus) private kampusRepository: Repository<Kampus>,
    @InjectRepository(Lokasi) private lokasiRepository: Repository<Lokasi>,
    @InjectRepository(KategoriItem) private kategoriItemRepository: Repository<KategoriItem>,
    @InjectRepository(MasterItem) private masterItemRepository: Repository<MasterItem>,
  ) {}

  // === METODE UNTUK UNIT UTAMA ===
  
  async findAllUnitUtama() {
    console.log("Mengambil semua data unit utama");
    const unitUtama = await this.unitUtamaRepository.find({
      order: { nama_unit_utama: 'ASC' }
    });
    console.log(`Ditemukan ${unitUtama.length} unit utama`);
    return unitUtama;
  }

  async createUnitUtama(data: CreateUnitUtamaDto) {
    console.log("Membuat unit utama baru:", data);
    
    // Cek apakah kode sudah ada
    const existing = await this.unitUtamaRepository.findOne({
      where: { kode_unit_utama: data.kode_unit_utama }
    });
    
    if (existing) {
      throw new BadRequestException('Kode unit utama sudah digunakan');
    }
    
    const newUnitUtama = this.unitUtamaRepository.create(data);
    const result = await this.unitUtamaRepository.save(newUnitUtama);
    console.log("Unit utama berhasil dibuat:", result);
    return result;
  }

  async updateUnitUtama(id: number, data: UpdateUnitUtamaDto) {
    console.log(`Memperbarui unit utama ID: ${id} dengan data:`, data);
    
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
    const result = await this.unitUtamaRepository.findOneBy({ id_unit_utama: id });
    console.log("Unit utama berhasil diperbarui:", result);
    return result;
  }

  async removeUnitUtama(id: number) {
    console.log(`Menghapus unit utama ID: ${id}`);
    
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
    console.log("Unit utama berhasil dihapus");
    return { message: 'Unit Utama berhasil dihapus' };
  }

  // === METODE UNTUK UNIT KERJA ===
  
  async findAllUnitKerja() {
    console.log("Mengambil semua data unit kerja");
    const unitKerja = await this.unitKerjaRepository.find({ 
      relations: ['unitUtama'],
      order: { nama_unit: 'ASC' }
    });
    console.log(`Ditemukan ${unitKerja.length} unit kerja`);
    return unitKerja;
  }

  async createUnitKerja(data: CreateUnitKerjaDto) {
    console.log("Membuat unit kerja baru:", data);
    
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
    
    const newUnitKerja = this.unitKerjaRepository.create(data);
    const result = await this.unitKerjaRepository.save(newUnitKerja);
    console.log("Unit kerja berhasil dibuat:", result);
    return result;
  }

  async updateUnitKerja(id: number, data: UpdateUnitKerjaDto) {
    console.log(`Memperbarui unit kerja ID: ${id} dengan data:`, data);
    
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
    const result = await this.unitKerjaRepository.findOne({
      where: { id_unit_kerja: id },
      relations: ['unitUtama']
    });
    console.log("Unit kerja berhasil diperbarui:", result);
    return result;
  }

  async removeUnitKerja(id: number) {
    console.log(`Menghapus unit kerja ID: ${id}`);
    
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
    console.log("Unit kerja berhasil dihapus");
    return { message: 'Unit Kerja berhasil dihapus' };
  }

  // === METODE UNTUK GEDUNG ===
  
  async findAllGedung() {
    console.log("Mengambil semua data gedung");
    const gedung = await this.gedungRepository.find({
      relations: ['kampus'],
      order: { nama_gedung: 'ASC' }
    });
    console.log(`Ditemukan ${gedung.length} gedung`);
    return gedung;
  }

  async findGedungByKampus(id_kampus: number): Promise<Gedung[]> {
    console.log(`Mencari gedung untuk kampus ID: ${id_kampus}`);
    const gedungList = await this.gedungRepository.find({
      where: { id_kampus },
      relations: ['kampus'],
      order: { nama_gedung: 'ASC' }
    });
    console.log(`Ditemukan ${gedungList.length} gedung`);
    return gedungList;
  }

  async createGedung(data: CreateGedungDto) {
    console.log("Membuat gedung baru:", data);
    
    // Cek apakah kode sudah ada
    const existing = await this.gedungRepository.findOne({
      where: { kode_gedung: data.kode_gedung }
    });
    
    if (existing) {
      throw new BadRequestException('Kode gedung sudah digunakan');
    }

    // Cek apakah kampus ada
    const kampus = await this.kampusRepository.findOneBy({
      id_kampus: data.id_kampus
    });
    
    if (!kampus) {
      throw new BadRequestException('Kampus tidak ditemukan');
    }
    
    const newGedung = this.gedungRepository.create(data);
    const result = await this.gedungRepository.save(newGedung);
    console.log("Gedung berhasil dibuat:", result);
    return result;
  }

  async updateGedung(id: number, data: UpdateGedungDto) {
    console.log(`Memperbarui gedung ID: ${id} dengan data:`, data);
    
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

    // Cek apakah kampus ada jika diubah
    if (data.id_kampus && data.id_kampus !== gedung.id_kampus) {
      const kampus = await this.kampusRepository.findOneBy({
        id_kampus: data.id_kampus
      });
      
      if (!kampus) {
        throw new BadRequestException('Kampus tidak ditemukan');
      }
    }

    await this.gedungRepository.update(id, data);
    const result = await this.gedungRepository.findOne({
      where: { id_gedung: id },
      relations: ['kampus']
    });
    console.log("Gedung berhasil diperbarui:", result);
    return result;
  }

  async removeGedung(id: number) {
    console.log(`Menghapus gedung ID: ${id}`);
    
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
    console.log("Gedung berhasil dihapus");
    return { message: 'Gedung berhasil dihapus' };
  }

  // === METODE UNTUK LOKASI ===
  
  async findAllLokasi() {
    console.log("Mengambil semua data lokasi");
    const lokasi = await this.lokasiRepository.find({ 
      relations: ['gedung', 'unitKerja'],
      order: { nama_ruangan: 'ASC' }
    });
    console.log(`Ditemukan ${lokasi.length} lokasi`);
    return lokasi;
  }

  async findLokasiByGedung(id_gedung: number): Promise<Lokasi[]> {
    console.log(`Mencari lokasi untuk gedung ID: ${id_gedung}`);
    const lokasiList = await this.lokasiRepository.find({
      where: { id_gedung },
      relations: ['gedung', 'unitKerja'],
      order: { nama_ruangan: 'ASC' }
    });
    console.log(`Ditemukan ${lokasiList.length} lokasi`);
    return lokasiList;
  }

  async createLokasi(data: CreateLokasiDto) {
    console.log("Membuat lokasi baru:", data);
    
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
    
    const newLokasi = this.lokasiRepository.create(data);
    const result = await this.lokasiRepository.save(newLokasi);
    console.log("Lokasi berhasil dibuat:", result);
    return result;
  }

  async updateLokasi(id: number, data: UpdateLokasiDto) {
    console.log(`Memperbarui lokasi ID: ${id} dengan data:`, data);
    
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
    const result = await this.lokasiRepository.findOne({
      where: { id_lokasi: id },
      relations: ['gedung', 'unitKerja']
    });
    console.log("Lokasi berhasil diperbarui:", result);
    return result;
  }

  async removeLokasi(id: number) {
    console.log(`Menghapus lokasi ID: ${id}`);
    
    const lokasi = await this.lokasiRepository.findOneBy({ id_lokasi: id });
    if (!lokasi) {
      throw new NotFoundException('Lokasi tidak ditemukan');
    }

    await this.lokasiRepository.delete(id);
    console.log("Lokasi berhasil dihapus");
    return { message: 'Lokasi berhasil dihapus' };
  }

  // === METODE UNTUK KATEGORI ITEM ===
  
  async findAllKategoriItem() {
    console.log("Mengambil semua data kategori item");
    const kategori = await this.kategoriItemRepository.find({
      order: { nama_kategori: 'ASC' }
    });
    console.log(`Ditemukan ${kategori.length} kategori item`);
    return kategori;
  }

  async createKategoriItem(data: CreateKategoriItemDto) {
    console.log("Membuat kategori item baru:", data);
    
    // Cek apakah nama sudah ada
    const existing = await this.kategoriItemRepository.findOne({
      where: { nama_kategori: data.nama_kategori }
    });
    
    if (existing) {
      throw new BadRequestException('Nama kategori sudah digunakan');
    }
    
    const newKategori = this.kategoriItemRepository.create(data);
    const result = await this.kategoriItemRepository.save(newKategori);
    console.log("Kategori item berhasil dibuat:", result);
    return result;
  }

  async updateKategoriItem(id: number, data: UpdateKategoriItemDto) {
    console.log(`Memperbarui kategori item ID: ${id} dengan data:`, data);
    
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
    const result = await this.kategoriItemRepository.findOneBy({ id_kategori: id });
    console.log("Kategori item berhasil diperbarui:", result);
    return result;
  }

  async removeKategoriItem(id: number) {
    console.log(`Menghapus kategori item ID: ${id}`);
    
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
    console.log("Kategori item berhasil dihapus");
    return { message: 'Kategori Item berhasil dihapus' };
  }

  // === METODE UNTUK MASTER ITEM ===
  
  async findAllMasterItem() {
    console.log("Mengambil semua data master item");
    const item = await this.masterItemRepository.find({ 
      relations: ['kategori'],
      order: { nama_item: 'ASC' }
    });
    console.log(`Ditemukan ${item.length} master item`);
    return item;
  }

  async createMasterItem(data: CreateMasterItemDto) {
    console.log("Membuat master item baru:", data);
    
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
    
    const newItem = this.masterItemRepository.create(data);
    const result = await this.masterItemRepository.save(newItem);
    console.log("Master item berhasil dibuat:", result);
    return result;
  }

  async updateMasterItem(id: number, data: UpdateMasterItemDto) {
    console.log(`Memperbarui master item ID: ${id} dengan data:`, data);
    
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
    const result = await this.masterItemRepository.findOne({
      where: { id_item: id },
      relations: ['kategori']
    });
    console.log("Master item berhasil diperbarui:", result);
    return result;
  }

  async removeMasterItem(id: number) {
    console.log(`Menghapus master item ID: ${id}`);
    
    const item = await this.masterItemRepository.findOneBy({ id_item: id });
    if (!item) {
      throw new NotFoundException('Master Item tidak ditemukan');
    }

    await this.masterItemRepository.delete(id);
    console.log("Master item berhasil dihapus");
    return { message: 'Master Item berhasil dihapus' };
  }

  // === METODE UNTUK KAMPUS ===
  
  async createKampus(createKampusDto: CreateKampusDto): Promise<Kampus> {
    console.log("Membuat kampus baru:", createKampusDto);
    
    // Cek apakah kode sudah ada
    const existing = await this.kampusRepository.findOne({
      where: { kode_kampus: createKampusDto.kode_kampus }
    });
    
    if (existing) {
      throw new BadRequestException('Kode kampus sudah digunakan');
    }
    
    const newKampus = this.kampusRepository.create(createKampusDto);
    const result = await this.kampusRepository.save(newKampus);
    console.log("Kampus berhasil dibuat:", result);
    return result;
  }

  async findAllKampus(): Promise<Kampus[]> {
    console.log("Mengambil semua data kampus");
    const kampus = await this.kampusRepository.find({ 
      order: { nama_kampus: 'ASC' } 
    });
    console.log(`Ditemukan ${kampus.length} kampus`);
    return kampus;
  }

  async findOneKampus(id: number): Promise<Kampus> {
    console.log(`Mencari kampus dengan ID: ${id}`);
    const kampus = await this.kampusRepository.findOneBy({ id_kampus: id });
    if (!kampus) {
      throw new NotFoundException(`Kampus dengan ID ${id} tidak ditemukan`);
    }
    return kampus;
  }

  async updateKampus(id: number, updateKampusDto: UpdateKampusDto): Promise<Kampus> {
    console.log(`Memperbarui kampus ID: ${id} dengan data:`, updateKampusDto);
    
    const kampus = await this.findOneKampus(id);
    
    // Cek apakah kode sudah ada (kecuali untuk kampus yang sama)
    if (updateKampusDto.kode_kampus && updateKampusDto.kode_kampus !== kampus.kode_kampus) {
      const existing = await this.kampusRepository.findOne({
        where: { kode_kampus: updateKampusDto.kode_kampus }
      });
      
      if (existing) {
        throw new BadRequestException('Kode kampus sudah digunakan');
      }
    }
    
    Object.assign(kampus, updateKampusDto);
    const result = await this.kampusRepository.save(kampus);
    console.log("Kampus berhasil diperbarui:", result);
    return result;
  }

  async removeKampus(id: number): Promise<{ message: string }> {
    console.log(`Menghapus kampus ID: ${id}`);
    
    const kampus = await this.findOneKampus(id);
    
    // Cek apakah ada gedung yang terkait
    const gedungCount = await this.gedungRepository.count({
      where: { id_kampus: id }
    });

    if (gedungCount > 0) {
      throw new BadRequestException('Tidak dapat menghapus kampus yang masih memiliki gedung terkait');
    }
    
    await this.kampusRepository.delete(id);
    console.log("Kampus berhasil dihapus");
    return { message: 'Kampus berhasil dihapus' };
  }

  // === METODE KHUSUS UNTUK FITUR LAPORAN ===
  
  /**
   * Metode untuk mendapatkan unit kerja berdasarkan gedung
   */
  async findUnitKerjaByGedung(id_gedung: number): Promise<UnitKerja[]> {
    console.log(`Mencari unit kerja untuk gedung ID: ${id_gedung}`);
    
    // Pendekatan yang lebih sederhana dan lebih dapat diandalkan
    // Cari semua lokasi di gedung ini dan dapatkan unit kerja yang terkait
    const lokasiList = await this.lokasiRepository.find({
      where: { id_gedung },
      relations: ['unitKerja']
    });
    
    console.log(`Ditemukan ${lokasiList.length} lokasi di gedung ini`);
    
    // Ekstrak unit kerja unik dari lokasi
    const unitKerjaMap = new Map<number, UnitKerja>();
    
    lokasiList.forEach(lokasi => {
      if (lokasi.unitKerja && lokasi.id_unit_kerja) {
        unitKerjaMap.set(lokasi.id_unit_kerja, lokasi.unitKerja);
      }
    });
    
    const unitKerjaList = Array.from(unitKerjaMap.values());
    console.log('Unit kerja yang ditemukan:', unitKerjaList);
    
    return unitKerjaList;
  }

  /**
   * Metode untuk mendapatkan lokasi berdasarkan gedung dan unit kerja
   */
  async findLokasiByGedungAndUnit(gedungId: number, unitKerjaId: number): Promise<Lokasi[]> {
    console.log(`Mencari lokasi untuk gedung ID: ${gedungId} dan unit kerja ID: ${unitKerjaId}`);
    
    const lokasiList = await this.lokasiRepository.find({
      where: { 
        id_gedung: gedungId,
        id_unit_kerja: unitKerjaId
      },
      relations: ['gedung', 'unitKerja'],
      order: { nama_ruangan: 'ASC' }
    });
    
    console.log(`Ditemukan ${lokasiList.length} lokasi`);
    console.log('Detail lokasi:', lokasiList);
    
    return lokasiList;
  }
}