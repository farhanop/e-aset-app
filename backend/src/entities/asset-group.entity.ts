// src/entities/asset-group.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Lokasi } from './lokasi.entity';
import { UnitKerja } from './unit-kerja.entity';
import { Asset } from './asset.entity';

@Entity({ name: 'tbl_aset_group' })
export class AssetGroup {
  @PrimaryGeneratedColumn()
  id_group: number;

  @Column({ unique: true, length: 100 })
  kode_group: string;

  @Column({ length: 255 })
  nama_group: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column()
  id_lokasi: number;

  @Column()
  id_unit_kerja: number;

  // --- Relasi ---
  @ManyToOne(() => Lokasi)
  @JoinColumn({ name: 'id_lokasi' })
  lokasi: Lokasi;

  @ManyToOne(() => UnitKerja)
  @JoinColumn({ name: 'id_unit_kerja' })
  unitKerja: UnitKerja;

  @OneToMany(() => Asset, (asset) => asset.group)
  assets: Asset[];
}
