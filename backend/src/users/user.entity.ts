// backend\src\users\user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PeminjamanBarang } from 'src/entities/peminjaman-barang.entity';
import { PengembalianBarang } from 'src/entities/pengembalian-barang.entity';

@Entity({ name: 'tbl_users' })
export class User {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column()
  nama_lengkap: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: ['aktif', 'nonaktif'],
    default: 'aktif',
  })
  status: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  nomor_telepon: string;

  @Column({
    type: 'enum',
    enum: ['super-admin', 'admin', 'staff'],
    default: 'staff',
  })
  role: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto_profil: string;

  @OneToMany(() => PeminjamanBarang, (peminjaman) => peminjaman.petugasPinjam)
  peminjamanBarang: PeminjamanBarang[];

  @OneToMany(
    () => PengembalianBarang,
    (pengembalian) => pengembalian.petugasKembali,
  )
  pengembalianBarang: PengembalianBarang[];
}
