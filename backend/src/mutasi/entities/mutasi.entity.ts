// src/modules/mutasi/entities/mutasi.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from '../../entities/asset.entity';

@Entity('tbl_mutasi_aset')
export class Mutasi {
  @PrimaryGeneratedColumn({ name: 'id_mutasi' })
  id_mutasi: number;

  @Column({ name: 'id_aset' })
  id_aset: number;

  @ManyToOne(() => Asset, { eager: true })
  @JoinColumn({ name: 'id_aset' })
  aset: Asset;

  @Column({ name: 'id_lokasi_lama' })
  id_lokasi_lama: number;

  @Column({ name: 'id_lokasi_baru' })
  id_lokasi_baru: number;

  @Column({ name: 'tgl_mutasi', type: 'date' })
  tgl_mutasi: Date;

  @Column({ name: 'catatan', type: 'text', nullable: true })
  catatan: string;

  @Column({ name: 'id_petugas' })
  id_petugas: number;
}
