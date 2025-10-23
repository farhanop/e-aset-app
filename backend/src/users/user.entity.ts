import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../roles/entities/role.entity';

@Entity({ name: 'tbl_users' })
export class User {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column()
  nama_lengkap: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) 
  password: string;

  @Column({
    type: 'enum',
    enum: ['aktif', 'nonaktif'],
    default: 'aktif',
  })
  status: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  nomor_telepon: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto_profil: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'tbl_user_roles',
    joinColumn: { name: 'id_user', referencedColumnName: 'id_user' },
    inverseJoinColumn: { name: 'id_role', referencedColumnName: 'id_role' },
  })
  roles: Role[];
}