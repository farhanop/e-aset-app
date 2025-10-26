// backend/src/assets/assets.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { MasterItem } from '../entities/master-item.entity';
import { Lokasi } from '../entities/lokasi.entity';
import { UnitKerja } from '../entities/unit-kerja.entity';
import { Gedung } from '../entities/gedung.entity';
import { Kampus } from '../entities/kampus.entity';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateFromSampleDto } from './dto/create-from-sample.dto';
import * as qr from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset) private assetRepository: Repository<Asset>,
    @InjectRepository(MasterItem)
    private masterItemRepository: Repository<MasterItem>,
    @InjectRepository(Lokasi) private lokasiRepository: Repository<Lokasi>,
    @InjectRepository(UnitKerja)
    private unitKerjaRepository: Repository<UnitKerja>,
    @InjectRepository(Gedung) private gedungRepository: Repository<Gedung>,
    @InjectRepository(Kampus) private kampusRepository: Repository<Kampus>,
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset[]> {
    const {
      jumlah,
      id_item,
      id_lokasi,
      id_unit_kerja,
      tgl_perolehan,
      foto_barang,
      file_dokumen,
    } = createAssetDto;
    const createdAssets: Asset[] = [];

    const lastAsset = await this.assetRepository.findOne({
      where: {
        id_item,
        id_lokasi,
        id_unit_kerja,
      },
      order: { nomor_urut: 'DESC' },
    });
    let currentNomorUrut = lastAsset ? lastAsset.nomor_urut : 0;

    for (let i = 0; i < jumlah; i++) {
      currentNomorUrut++;
      const kode_aset = await this._generateKodeAset(
        id_lokasi,
        id_unit_kerja,
        id_item,
        currentNomorUrut,
        new Date(tgl_perolehan),
      );

      const qrCodeBuffer = await qr.toBuffer(kode_aset, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      const uploadDir = path.join(process.cwd(), 'uploads', 'qrcodes');
      await fs.mkdir(uploadDir, { recursive: true });

      const qrCodeFileName = `qrcode-${Date.now()}-${currentNomorUrut}.png`;
      const qrCodePath = path.join(uploadDir, qrCodeFileName);
      await fs.writeFile(qrCodePath, qrCodeBuffer);

      const newAsset = this.assetRepository.create({
        kode_aset,
        nomor_urut: currentNomorUrut,
        file_qrcode: `/uploads/qrcodes/${qrCodeFileName}`,
        foto_barang: foto_barang || undefined,
        file_dokumen: file_dokumen || undefined,
        id_item,
        id_lokasi,
        id_unit_kerja,
        id_group: createAssetDto.id_group,
        merk: createAssetDto.merk,
        tipe_model: createAssetDto.tipe_model,
        spesifikasi: createAssetDto.spesifikasi,
        tgl_perolehan: new Date(tgl_perolehan),
        sumber_dana: createAssetDto.sumber_dana,
        status_aset: createAssetDto.status_aset || 'Tersedia',
        kondisi_terakhir: createAssetDto.kondisi_terakhir || 'Baik',
      });

      const savedAsset = await this.assetRepository.save(newAsset);
      createdAssets.push(savedAsset);
    }

    return createdAssets;
  }

  private async _generateKodeAset(
    id_lokasi: number,
    id_unit_kerja: number,
    id_item: number,
    nomor_urut: number,
    tgl_perolehan: Date,
  ): Promise<string> {
    const lokasi = await this.lokasiRepository.findOne({
      where: { id_lokasi },
      relations: ['gedung', 'gedung.kampus'],
    });

    const unitKerja = await this.unitKerjaRepository.findOne({
      where: { id_unit_kerja },
      relations: ['unitUtama'],
    });

    const item = await this.masterItemRepository.findOneBy({ id_item });

    if (!lokasi || !unitKerja || !item || !lokasi.gedung) {
      throw new NotFoundException(
        'Data master (lokasi/unit/item) tidak ditemukan.',
      );
    }

    // Format sesuai permintaan: U21/LAB301/FT.3/PC.10/2025
    const kodeKampus = lokasi.gedung.kampus?.kode_kampus || 'U';
    const kodeGedung = lokasi.gedung.kode_gedung;
    const lantai = lokasi.lantai.toString();

    // Format: U + Gedung + Lantai
    const kodeLokasiGedung = `${kodeKampus}${kodeGedung}${lantai}`;

    const kodeRuangan = lokasi.kode_ruangan;

    // Format Unit Kerja: KodeFakultas.KodeProdi
    const kodeFakultas = unitKerja.unitUtama?.kode_unit_utama || 'FT';
    const kodeProdi = unitKerja.kode_unit;
    const kodeUnit = `${kodeFakultas}.${kodeProdi}`;

    // Format Item: KodeItem.NomorUrut
    const kodeItem = `${item.kode_item}.${nomor_urut}`;

    const tahun = tgl_perolehan.getFullYear();

    // Final format: U21/LAB301/FT.3/PC.10/2025
    return `${kodeLokasiGedung}/${kodeRuangan}/${kodeUnit}/${kodeItem}/${tahun}`;
  }

  async createFromSampleData(
    createFromSampleDto: CreateFromSampleDto,
  ): Promise<Asset[]> {
    const {
      kampus,
      gedung,
      lantai,
      ruangan,
      fakultas,
      prodi,
      jenis_barang,
      jumlah,
      tahun,
    } = createFromSampleDto;

    // Cari data master berdasarkan kriteria
    const kampusData = await this.kampusRepository.findOne({
      where: { kode_kampus: kampus },
    });

    if (!kampusData) {
      throw new NotFoundException(
        `Kampus dengan kode ${kampus} tidak ditemukan`,
      );
    }

    const gedungData = await this.gedungRepository.findOne({
      where: {
        kode_gedung: gedung,
        id_kampus: kampusData.id_kampus,
      },
    });

    if (!gedungData) {
      throw new NotFoundException(
        `Gedung dengan kode ${gedung} tidak ditemukan`,
      );
    }

    const unitKerjaData = await this.unitKerjaRepository.findOne({
      where: { kode_unit: prodi },
    });

    if (!unitKerjaData) {
      throw new NotFoundException(
        `Unit kerja dengan kode ${prodi} tidak ditemukan`,
      );
    }

    const masterItem = await this.masterItemRepository.findOne({
      where: { kode_item: jenis_barang },
    });

    if (!masterItem) {
      throw new NotFoundException(
        `Item dengan kode ${jenis_barang} tidak ditemukan`,
      );
    }

    const lokasiData = await this.lokasiRepository.findOne({
      where: {
        id_gedung: gedungData.id_gedung,
        lantai: lantai,
        kode_ruangan: ruangan,
      },
    });

    if (!lokasiData) {
      throw new NotFoundException(
        `Lokasi dengan gedung ${gedung}, lantai ${lantai}, ruangan ${ruangan} tidak ditemukan`,
      );
    }

    const createAssetDto: CreateAssetDto = {
      id_item: masterItem.id_item,
      id_lokasi: lokasiData.id_lokasi,
      id_unit_kerja: unitKerjaData.id_unit_kerja,
      jumlah: jumlah,
      tgl_perolehan: new Date(tahun, 0, 1),
      status_aset: 'Tersedia',
      kondisi_terakhir: 'Baik',
    };

    return this.create(createAssetDto);
  }

  async createFromYourSample(): Promise<Asset[]> {
    // Data hardcoded dari contoh Anda
    const sampleData: CreateFromSampleDto = {
      kampus: 'U',
      gedung: '2',
      lantai: 1,
      ruangan: 'LAB301',
      fakultas: 'FT',
      prodi: '3',
      jenis_barang: 'PC',
      jumlah: 10,
      tahun: 2025,
    };

    return this.createFromSampleData(sampleData);
  }

  async findAssetsByCriteria(criteria: {
    kampus?: string;
    gedung?: string;
    lantai?: number;
    ruangan?: string;
    fakultas?: string;
    prodi?: string;
    jenis_barang?: string;
    tahun?: number;
  }): Promise<Asset[]> {
    const query = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.lokasi', 'lokasi')
      .leftJoinAndSelect('lokasi.gedung', 'gedung')
      .leftJoinAndSelect('gedung.kampus', 'kampus')
      .leftJoinAndSelect('asset.unitKerja', 'unitKerja')
      .leftJoinAndSelect('unitKerja.unitUtama', 'unitUtama')
      .leftJoinAndSelect('asset.item', 'item');

    if (criteria.kampus) {
      query.andWhere('kampus.kode_kampus = :kampus', {
        kampus: criteria.kampus,
      });
    }

    if (criteria.gedung) {
      query.andWhere('gedung.kode_gedung = :gedung', {
        gedung: criteria.gedung,
      });
    }

    if (criteria.lantai) {
      query.andWhere('lokasi.lantai = :lantai', { lantai: criteria.lantai });
    }

    if (criteria.ruangan) {
      query.andWhere('lokasi.kode_ruangan = :ruangan', {
        ruangan: criteria.ruangan,
      });
    }

    if (criteria.prodi) {
      query.andWhere('unitKerja.kode_unit = :prodi', { prodi: criteria.prodi });
    }

    if (criteria.fakultas) {
      query.andWhere('unitUtama.kode_unit_utama = :fakultas', {
        fakultas: criteria.fakultas,
      });
    }

    if (criteria.jenis_barang) {
      query.andWhere('item.kode_item = :jenisBarang', {
        jenisBarang: criteria.jenis_barang,
      });
    }

    if (criteria.tahun) {
      query.andWhere('YEAR(asset.tgl_perolehan) = :tahun', {
        tahun: criteria.tahun,
      });
    }

    return query.getMany();
  }

  async updateQRCodePath(id: number, qrCodePath: string): Promise<Asset> {
    const asset = await this.findOne(id);
    asset.file_qrcode = qrCodePath;
    return this.assetRepository.save(asset);
  }

  async findAll(): Promise<Asset[]> {
    return this.assetRepository.find({
      relations: [
        'item',
        'item.kategori',
        'lokasi',
        'lokasi.gedung',
        'lokasi.gedung.kampus',
        'unitKerja',
        'unitKerja.unitUtama',
        'group',
      ],
    });
  }

  async findOne(id: number): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id_aset: id },
      relations: [
        'item',
        'item.kategori',
        'lokasi',
        'lokasi.gedung',
        'lokasi.gedung.kampus',
        'unitKerja',
        'unitKerja.unitUtama',
        'group',
      ],
    });

    if (!asset) {
      throw new NotFoundException(`Aset dengan ID ${id} tidak ditemukan`);
    }

    return asset;
  }

  async update(
    id: number,
    updateAssetDto: Partial<CreateAssetDto>,
  ): Promise<Asset> {
    const asset = await this.findOne(id);
    Object.assign(asset, updateAssetDto);
    return this.assetRepository.save(asset);
  }

  async remove(id: number): Promise<void> {
    const asset = await this.findOne(id);
    await this.assetRepository.remove(asset);
  }

  async findAllByLocation(id_lokasi: number): Promise<Asset[]> {
    const assets = await this.assetRepository.find({
      where: { id_lokasi: id_lokasi },
      relations: [
        'item',
        'item.kategori',
        'lokasi',
        'lokasi.gedung',
        'lokasi.gedung.kampus',
        'unitKerja',
        'unitKerja.unitUtama',
        'group',
      ],
    });

    if (!assets || assets.length === 0) {
      return [];
    }

    return assets;
  }

  async findAllGedung(): Promise<Gedung[]> {
    return this.gedungRepository.find({
      order: { nama_gedung: 'ASC' },
    });
  }

  async findUnitKerjaByGedung(id_gedung: number): Promise<UnitKerja[]> {
    const distinctUnitKerja = await this.lokasiRepository
      .createQueryBuilder('lokasi')
      .innerJoin('lokasi.unitKerja', 'unitKerja')
      .where('lokasi.id_gedung = :id_gedung', { id_gedung })
      .select([
        'unitKerja.id_unit_kerja',
        'unitKerja.kode_unit',
        'unitKerja.nama_unit',
        'unitKerja.id_unit_utama',
      ])
      .distinct(true)
      .getRawMany();

    return distinctUnitKerja.map((item) => ({
      id_unit_kerja: item.unitKerja_id_unit_kerja,
      kode_unit: item.unitKerja_kode_unit,
      nama_unit: item.unitKerja_nama_unit,
      id_unit_utama: item.unitKerja_id_unit_utama,
    })) as UnitKerja[];
  }

  async findLokasiByGedungAndUnit(
    gedungId: number,
    unitKerjaId: number,
  ): Promise<Lokasi[]> {
    return this.lokasiRepository.find({
      where: {
        id_gedung: gedungId,
        id_unit_kerja: unitKerjaId,
      },
      relations: ['gedung', 'unitKerja'],
      order: { nama_ruangan: 'ASC' },
    });
  }

  async findAllKampus(): Promise<Kampus[]> {
    return this.kampusRepository.find({
      order: { nama_kampus: 'ASC' },
    });
  }

  async findGedungByKampus(id_kampus: number): Promise<Gedung[]> {
    return this.gedungRepository.find({
      where: { id_kampus },
      order: { nama_gedung: 'ASC' },
    });
  }

  async findLokasiByGedung(id_gedung: number): Promise<Lokasi[]> {
    return this.lokasiRepository.find({
      where: { id_gedung },
      relations: ['gedung', 'unitKerja'],
      order: { lantai: 'ASC', nama_ruangan: 'ASC' },
    });
  }
}
