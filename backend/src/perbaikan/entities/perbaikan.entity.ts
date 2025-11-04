// src/modules/perbaikan/entities/perbaikan.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from '../../entities/asset.entity';

export enum PerbaikanStatus {
  DILAPORKAN = 'Dilaporkan',
  PROSES_PERBAIKAN = 'Proses Perbaikan',
  SELESAI = 'Selesai',
  TIDAK_BISA_DIPERBAIKI = 'Tidak Bisa Diperbaiki',
}

@Entity('tbl_perbaikan_barang')
export class Perbaikan {
  @PrimaryGeneratedColumn({ name: 'id_perbaikan' })
  id_perbaikan: number;

  @Column({ name: 'id_aset' })
  id_aset: number;

  @ManyToOne(() => Asset, { eager: true })
  @JoinColumn({ name: 'id_aset' })
  aset: Asset;

  @Column({ name: 'tgl_lapor_rusak', type: 'date' })
  tgl_lapor_rusak: Date;

  @Column({ name: 'deskripsi_kerusakan', type: 'text' })
  deskripsi_kerusakan: string;

  @Column({ name: 'id_pelapor' })
  id_pelapor: number;

  @Column({ name: 'tindakan_perbaikan', type: 'text', nullable: true })
  tindakan_perbaikan: string;

  @Column({
    name: 'biaya_perbaikan',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  biaya_perbaikan: number;

  @Column({ name: 'tgl_selesai_perbaikan', type: 'date', nullable: true })
  tgl_selesai_perbaikan: Date;

  @Column({
    name: 'status_perbaikan',
    type: 'enum',
    enum: PerbaikanStatus,
    default: PerbaikanStatus.DILAPORKAN,
  })
  status_perbaikan: PerbaikanStatus;
}
