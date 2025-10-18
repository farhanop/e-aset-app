import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { PeminjamanBarang } from './peminjaman-barang.entity';

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

  @Column({ type: 'text', nullable: true })
  catatan_pengembalian: string;

  // --- Relasi ---
  @OneToOne(() => PeminjamanBarang, peminjaman => peminjaman.pengembalian)
  @JoinColumn({ name: 'id_peminjaman' })
  peminjaman: PeminjamanBarang;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_petugas_kembali' })
  petugasKembali: User;
}
