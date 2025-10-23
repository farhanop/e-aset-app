// src/roles/entities/role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Permission } from './permission.entity';
import { User } from '../../users/user.entity';

@Entity({ name: 'tbl_roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id_role: number;

  @Column({ unique: true })
  nama_role: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

   @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  // Relasi ke Permission (jika ada)
  @ManyToMany(() => Permission, (permission) => permission.roles)

  // 👇 TAMBAHKAN BAGIAN INI
  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'tbl_role_permissions', // Nama tabel penghubung
    joinColumn: { name: 'id_role', referencedColumnName: 'id_role' },
    inverseJoinColumn: {
      name: 'id_permission',
      referencedColumnName: 'id_permission',
    },
  })
  permissions: Permission[];
}
