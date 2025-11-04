// src/modules/mutasi/entities/mutasi.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from '../../entities/asset.entity';
import { Lokasi } from 'src/entities/lokasi.entity';
import { UnitKerja } from 'src/entities/unit-kerja.entity';
import { User } from '../../users/user.entity'; // (Asumsi path)

@Entity('tbl_mutasi_aset')
export class Mutasi {
  @PrimaryGeneratedColumn({ name: 'id_mutasi' })
  id_mutasi: number;

  @Column({ name: 'id_aset' })
  id_aset: number;

  @Column({ name: 'id_lokasi_lama' })
  id_lokasi_lama: number;

  @Column({ name: 'id_lokasi_baru' })
  id_lokasi_baru: number;

  // Tambahkan kolom id_unit_kerja_lama dan baru jika ada di DB
  // Berdasarkan DB dump Anda, kolom ini TIDAK ADA, jadi kita tidak menambahkannya
  // @Column({ name: 'id_unit_kerja_lama' })
  // id_unit_kerja_lama: number;

  // @Column({ name: 'id_unit_kerja_baru' })
  // id_unit_kerja_baru: number;

  @Column({ name: 'tgl_mutasi', type: 'date' })
  tgl_mutasi: Date;

  @Column({ name: 'catatan', type: 'text', nullable: true })
  catatan: string;

  @Column({ name: 'id_petugas' })
  id_petugas: number;

  // --- RELASI ---

  @ManyToOne(() => Asset, { eager: true }) // eager: true agar data aset selalu ikut
  @JoinColumn({ name: 'id_aset' })
  aset: Asset;

  @ManyToOne(() => Lokasi)
  @JoinColumn({ name: 'id_lokasi_lama' })
  lokasiLama: Lokasi;

  @ManyToOne(() => Lokasi)
  @JoinColumn({ name: 'id_lokasi_baru' })
  lokasiBaru: Lokasi;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_petugas' })
  petugas: User;

  // Catatan: Anda juga bisa menambahkan relasi untuk unit_kerja
  // jika Anda menambahkannya ke tabel tbl_mutasi_aset.
  // Saat ini, DB dump Anda tidak memilikinya.
}
