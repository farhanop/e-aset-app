// src/entities/lokasi.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Gedung } from './gedung.entity';
import { UnitKerja } from './unit-kerja.entity';

@Entity({ name: 'tbl_lokasi' })
export class Lokasi {
  @PrimaryGeneratedColumn()
  id_lokasi: number;

  @Column({ length: 50 })
  kode_ruangan: string;

  @Column({ length: 100 })
  nama_ruangan: string;

  @Column()
  lantai: number;

  @Column()
  id_gedung: number;

  @Column({ nullable: true })
  id_unit_kerja: number;

  @ManyToOne(() => Gedung)
  @JoinColumn({ name: 'id_gedung' })
  gedung: Gedung;

  @ManyToOne(() => UnitKerja)
  @JoinColumn({ name: 'id_unit_kerja' })
  unitKerja: UnitKerja;
}
