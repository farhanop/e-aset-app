// src/entities/unit-utama.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'tbl_unit_utama' })
export class UnitUtama {
  @PrimaryGeneratedColumn()
  id_unit_utama: number;

  @Column({ unique: true, length: 20 })
  kode_unit_utama: string;

  @Column({ length: 100 })
  nama_unit_utama: string;
}