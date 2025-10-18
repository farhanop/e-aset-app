// src/entities/unit-kerja.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UnitUtama } from './unit-utama.entity';

@Entity({ name: 'tbl_unit_kerja' })
export class UnitKerja {
  @PrimaryGeneratedColumn()
  id_unit_kerja: number;

  @Column({ length: 20 })
  kode_unit: string;

  @Column({ length: 100 })
  nama_unit: string;

  @Column()
  id_unit_utama: number;

  @ManyToOne(() => UnitUtama)
  @JoinColumn({ name: 'id_unit_utama' })
  unitUtama: UnitUtama;

  
}
