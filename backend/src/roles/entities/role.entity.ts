import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Permission } from './permission.entity';

@Entity({ name: 'tbl_roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id_role: number;

  @Column({ unique: true })
  nama_role: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  // HAPUS relasi ke User karena kita menggunakan kolom role langsung di tbl_users

  // Relasi ke Permission (jika ada)
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'tbl_role_permissions',
    joinColumn: { name: 'id_role', referencedColumnName: 'id_role' },
    inverseJoinColumn: {
      name: 'id_permission',
      referencedColumnName: 'id_permission',
    },
  })
  permissions: Permission[];
}
