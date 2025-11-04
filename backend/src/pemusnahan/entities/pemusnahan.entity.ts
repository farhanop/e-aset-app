// src/modules/pemusnahan/entities/pemusnahan.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from '../../entities/asset.entity';

export enum PemusnahanMetode {
  DIBAKAR = 'Dibakar',
  DITUMPUK = 'Ditumpuk',
  DIPOTONG = 'Dipotong',
  DILEBURKAN = 'Dileburkan',
  LAINNYA = 'Lainnya',
}

@Entity('tbl_pemusnahan_barang')
export class Pemusnahan {
  @PrimaryGeneratedColumn({ name: 'id_pemusnahan' })
  id_pemusnahan: number;

  @Column({ name: 'id_aset' })
  id_aset: number;

  @ManyToOne(() => Asset, { eager: true })
  @JoinColumn({ name: 'id_aset' })
  aset: Asset;

  @Column({ name: 'tgl_pemusnahan', type: 'date' })
  tgl_pemusnahan: Date;

  @Column({ name: 'metode_pemusnahan' })
  metode_pemusnahan: PemusnahanMetode;

  @Column({ name: 'alasan_pemusnahan', type: 'text' })
  alasan_pemusnahan: string;

  @Column({ name: 'no_surat_persetujuan', nullable: true })
  no_surat_persetujuan: string;

  @Column({ name: 'id_petugas_pemusnahan' })
  id_petugas_pemusnahan: number;
}
