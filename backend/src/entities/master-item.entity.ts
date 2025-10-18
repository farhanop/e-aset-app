// src/entities/master-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KategoriItem } from './kategori-item.entity'; // Kita asumsikan file ini akan dibuat

@Entity({ name: 'tbl_master_item' })
export class MasterItem {
  @PrimaryGeneratedColumn()
  id_item: number;

  @Column({ length: 255 })
  nama_item: string;

  @Column({ unique: true, length: 100 })
  kode_item: string;

  @Column()
  id_kategori: number;

  @Column({
    type: 'enum',
    enum: ['Individual', 'Stok'],
  })
  metode_pelacakan: string;

  @Column({ nullable: true })
  umur_ekonomis: number;

  // --- Relasi ---
  @ManyToOne(() => KategoriItem)
  @JoinColumn({ name: 'id_kategori' })
  kategori: KategoriItem;
}
