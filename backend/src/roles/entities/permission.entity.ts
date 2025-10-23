// src/roles/entities/permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'tbl_permissions' })
export class Permission {
  @PrimaryGeneratedColumn()
  id_permission: number;

  @Column({ unique: true })
  nama_permission: string;

  @Column()
  deskripsi_fitur: string;

  // 👇 TAMBAHKAN BAGIAN INI (SISI SEBALIKNYA)
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
