// file: backend/src/entities/gedung.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Kampus } from './kampus.entity';
import { Lokasi } from './lokasi.entity';

@Entity({ name: 'tbl_gedung' })
export class Gedung {
  @PrimaryGeneratedColumn()
  id_gedung: number;

  @Column({ length: 20, unique: true })
  kode_gedung: string;

  @Column({ length: 100 })
  nama_gedung: string;

  @Column({ nullable: true })
  id_kampus: number;

  @ManyToOne(() => Kampus, kampus => kampus.gedungs) // Perbaikan di sini
  @JoinColumn({ name: 'id_kampus' })
  kampus: Kampus;

  @OneToMany(() => Lokasi, lokasi => lokasi.gedung)
  lokasis: Lokasi[]; // Perbaiki nama properti untuk konsistensi
}