// src/entities/pengembalian-barang.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { PeminjamanBarang } from './peminjaman-barang.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'tbl_pengembalian_barang' })
export class PengembalianBarang {
  @PrimaryGeneratedColumn()
  id_pengembalian: number;

  @Column()
  id_peminjaman: number;

  @Column({ type: 'date' })
  tgl_aktual_kembali: Date;

  @Column()
  id_petugas_kembali: number;

  // --- Relasi ---
  @OneToOne(() => PeminjamanBarang, (peminjaman) => peminjaman.pengembalian)
  @JoinColumn({ name: 'id_peminjaman' })
  peminjaman: PeminjamanBarang;

  @ManyToOne(() => User, (user) => user.pengembalianBarang)
  @JoinColumn({ name: 'id_petugas_kembali' })
  petugasKembali: User;
}
