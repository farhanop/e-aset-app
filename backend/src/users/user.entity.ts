// backend/src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../roles/entities/role.entity';

@Entity('tbl_users') // Sesuaikan dengan nama tabel di database
export class User {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nama_lengkap: string;

  @Column({ nullable: true })
  nomor_telepon: string;

  @Column({ nullable: true })
  foto_profil: string;

  @Column({ default: 'aktif' })
  status: string;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'tbl_user_roles', // Sesuaikan dengan nama tabel di database
    joinColumn: { name: 'id_user', referencedColumnName: 'id_user' },
    inverseJoinColumn: { name: 'id_role', referencedColumnName: 'id_role' }
  })
  roles: Role[];
}