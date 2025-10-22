// backend/src/roles/entities/permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';

@Entity('tbl_permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id_permission: number;

  @Column()
  deskripsi_fitur: string;

  @Column()
  nama_permission: string;

  @ManyToMany(() => Role, role => role.permissions)
  @JoinTable({
    name: 'tbl_role_permissions',
    joinColumn: { name: 'id_permission', referencedColumnName: 'id_permission' },
    inverseJoinColumn: { name: 'id_role', referencedColumnName: 'id_role' }
  })
  roles: Role[];
}