// file: backend/src/entities/unit-utama.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UnitKerja } from './unit-kerja.entity';

@Entity({ name: 'tbl_unit_utama' })
export class UnitUtama {
  @PrimaryGeneratedColumn()
  id_unit_utama: number;

  @Column({ length: 20 })
  kode_unit_utama: string;

  @Column({ length: 100 })
  nama_unit_utama: string;

  @OneToMany(() => UnitKerja, unitKerja => unitKerja.unitUtama)
  unitKerjas: UnitKerja[];
}