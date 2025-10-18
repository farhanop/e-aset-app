// src/entities/gedung.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'tbl_gedung' })
export class Gedung {
  @PrimaryGeneratedColumn()
  id_gedung: number;

  @Column({ unique: true, length: 20 })
  kode_gedung: string;

  @Column({ length: 100 })
  nama_gedung: string;
}
