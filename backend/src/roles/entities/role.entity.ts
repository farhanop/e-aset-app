// backend/src/roles/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/user.entity';
import { Permission } from './permission.entity';

@Entity('tbl_roles')
export class Role {
  @PrimaryGeneratedColumn()
  id_role: number;

  @Column({ unique: true })
  nama_role: string;

  @Column({ nullable: true })
  deskripsi: string;

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @ManyToMany(() => Permission, permission => permission.roles)
  permissions: Permission[];
}