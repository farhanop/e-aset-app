import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Asset } from './asset.entity';
import { User } from '../users/user.entity';
import { PengembalianBarang } from './pengembalian-barang.entity';

@Entity({ name: 'tbl_peminjaman_barang' })
export class PeminjamanBarang {
  @PrimaryGeneratedColumn()
  id_peminjaman: number;

  @Column()
  id_aset: number;

  @Column({ length: 100 })
  nama_peminjam: string;

  @Column({ length: 50 })
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
  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'id_aset' })
  asset: Asset;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_petugas_pinjam' })
  petugasPinjam: User;

  @OneToOne(() => PengembalianBarang, pengembalian => pengembalian.peminjaman)
  pengembalian: PengembalianBarang;
}
