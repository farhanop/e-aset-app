// file: backend/src/entities/kampus.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Gedung } from './gedung.entity';

@Entity({ name: 'tbl_kampus' })
export class Kampus {
  @PrimaryGeneratedColumn()
  id_kampus: number;

  @Column({ length: 20, unique: true })
  kode_kampus: string;

  @Column({ length: 150 })
  nama_kampus: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Gedung, gedung => gedung.kampus)
  gedungs: Gedung[];
}