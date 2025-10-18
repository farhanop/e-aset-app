// src/entities/kategori-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MasterItem } from './master-item.entity';

@Entity({ name: 'tbl_kategori_item' })
export class KategoriItem {
  @PrimaryGeneratedColumn()
  id_kategori: number;

  @Column({ unique: true, length: 100 })
  nama_kategori: string;

  // --- Relasi (Sisi Sebaliknya) ---
  @OneToMany(() => MasterItem, (item) => item.kategori)
  items: MasterItem[];
}
