// src/entities/peminjaman-barang.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { PengembalianBarang } from './pengembalian-barang.entity';
import { Asset } from './asset.entity';

@Entity({ name: 'tbl_peminjaman_barang' })
export class PeminjamanBarang {
  @PrimaryGeneratedColumn()
  id_peminjaman: number;

  @Column()
  id_aset: number;

  @Column({ type: 'varchar', length: 100 })
  nama_peminjam: string;

  @Column({ type: 'varchar', length: 50 })
  identitas_peminjam: string;

  @Column({ type: 'date' })
  tgl_pinjam: Date;

  @Column({ type: 'date' })
  tgl_rencana_kembali: Date;

  @Column({
    type: 'enum',
    enum: ['Dipinjam', 'Dikembalikan', 'Terlambat'],
    default: 'Dipinjam',
  })
  status_peminjaman: string;

  @Column()
  id_petugas_pinjam: number;

  // --- Relasi ---
  @ManyToOne(() => User, (user) => user.peminjamanBarang)
  @JoinColumn({ name: 'id_petugas_pinjam' })
  petugasPinjam: User;

  @ManyToOne(() => Asset, (asset) => asset.peminjamanBarang)
  @JoinColumn({ name: 'id_aset' })
  asset: Asset;

  @OneToOne(() => PengembalianBarang, (pengembalian) => pengembalian.peminjaman)
  pengembalian: PengembalianBarang;
}
