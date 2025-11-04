// src/entities/unit-kerja.entity.ts (perlu dibuat jika belum ada)

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UnitUtama } from './unit-utama.entity';
import { Lokasi } from './lokasi.entity';

@Entity({ name: 'tbl_unit_kerja' })
export class UnitKerja {
  @PrimaryGeneratedColumn()
  id_unit_kerja: number;

  @Column({ length: 20, unique: true })
  kode_unit: string;

  @Column({ length: 100 })
  nama_unit: string;

  @Column()
  id_unit_utama: number;

  @ManyToOne(() => UnitUtama, unitUtama => unitUtama.unitKerjas)
  @JoinColumn({ name: 'id_unit_utama' })
  unitUtama: UnitUtama;

  @OneToMany(() => Lokasi, lokasi => lokasi.unitKerja)
  lokasi: Lokasi[];
}