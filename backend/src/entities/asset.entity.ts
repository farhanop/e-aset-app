// src/entities/asset.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MasterItem } from './master-item.entity';
import { Lokasi } from './lokasi.entity';
import { UnitKerja } from './unit-kerja.entity';
import { AssetGroup } from './asset-group.entity';

@Entity({ name: 'tbl_aset' })
export class Asset {
  @PrimaryGeneratedColumn()
  id_aset: number;

  @Column({ unique: true, length: 255 })
  kode_aset: string;

  @Column({ length: 255, nullable: true})
  file_qrcode: string;

  @Column({ length: 255, nullable: true}) 
  foto_barang: string;

  // Gunakan nama kolom yang sesuai dengan database
  @Column({ length: 255, nullable: true})
  file_dokumen: string;

  @Column()
  id_item: number;

  @Column()
  id_lokasi: number;

  @Column()
  id_unit_kerja: number;

  @Column({ nullable: true })
  id_group: number;

  @Column({ length: 100, nullable: true })
  merk: string;

  @Column({ length: 100, nullable: true })
  tipe_model: string;

  @Column({ type: 'text', nullable: true })
  spesifikasi: string;

  @Column({ type: 'date' })
  tgl_perolehan: Date;

  @Column({ length: 100, nullable: true })
  sumber_dana: string;

  @Column()
  nomor_urut: number;

  @Column({
    type: 'enum',
    enum: [
      'Tersedia',
      'Dipinjam',
      'Dalam Perbaikan',
      'Rusak',
      'Hilang',
      'Dihapuskan',
    ],
    default: 'Tersedia',
  })
  status_aset: string;

  @Column({
    type: 'enum',
    enum: ['Baik', 'Rusak', 'Perbaikan', 'Hilang'],
    nullable: true,
  })
  kondisi_terakhir: string;

  // --- Relasi ---
  @ManyToOne(() => MasterItem, { eager: true })
  @JoinColumn({ name: 'id_item' })
  item: MasterItem;

  @ManyToOne(() => Lokasi)
  @JoinColumn({ name: 'id_lokasi' })
  lokasi: Lokasi;

  @ManyToOne(() => UnitKerja)
  @JoinColumn({ name: 'id_unit_kerja' })
  unitKerja: UnitKerja;

  @ManyToOne(() => AssetGroup, { nullable: true })
  @JoinColumn({ name: 'id_group' })
  group: AssetGroup;
}