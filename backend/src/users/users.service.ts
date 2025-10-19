import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  /**
   * Helper untuk menghapus password dari objek user
   */
  private excludePassword(user: User): Omit<User, 'password'> {
    const { password, ...result } = user;
    return result;
  }

  /**
   * Membuat pengguna baru, melakukan hash pada password, dan menyimpannya ke database.
   * @param createUserDto - Data untuk pengguna baru.
   * @returns Objek pengguna yang baru dibuat tanpa password.
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { username, email, password, nama_lengkap } = createUserDto;

    // Cek duplikasi username atau email
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username atau Email sudah terdaftar');
    }

    // Proses hashing password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat entitas user baru
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      nama_lengkap,
      status: 'aktif', // Set status default
    });

    // Simpan user ke database
    const savedUser = await this.usersRepository.save(user);

    // Hapus properti password dari objek yang dikembalikan ke client
    return this.excludePassword(savedUser);
  }

  /**
   * Mengambil semua pengguna dari database dengan pagination.
   * @param page - Nomor halaman
   * @param limit - Jumlah data per halaman
   * @returns Daftar semua pengguna tanpa password.
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Omit<User, 'password'>[]; total: number }> {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['roles'],
    });

    // Pastikan password tidak pernah dikirim ke frontend
    const usersWithoutPassword = users.map((user) => this.excludePassword(user));

    return { data: usersWithoutPassword, total };
  }

  /**
   * Mencari satu pengguna berdasarkan ID-nya.
   * @param id - ID pengguna yang dicari.
   * @returns Objek pengguna tanpa password.
   */
  async findOneById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id_user: id },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }
    
    return this.excludePassword(user);
  }

  /**
   * Mencari satu pengguna berdasarkan username-nya, termasuk hash password.
   * Digunakan oleh AuthService untuk validasi login.
   * @param username - Username yang dicari.
   * @returns Objek pengguna (termasuk password) atau null jika tidak ditemukan.
   */
  async findOneByUsername(username: string): Promise<User | null> {
    // Menggunakan query builder untuk secara eksplisit memilih kolom password
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .addSelect('user.password') // Memaksa kolom password untuk disertakan
      .where('user.username = :username', { username })
      .getOne();
  }

  /**
   * Memperbarui data pengguna.
   * @param id - ID pengguna yang akan diperbarui.
   * @param updateUserDto - Data baru untuk pengguna.
   * @returns Objek pengguna yang sudah diperbarui tanpa password.
   */
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id_user: id },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }

    // Cek jika username atau email baru sudah digunakan
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });
      
      if (existingUser) {
        throw new ConflictException('Username sudah digunakan oleh pengguna lain');
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      
      if (existingUser) {
        throw new ConflictException('Email sudah digunakan oleh pengguna lain');
      }
    }

    // Jika ada password baru, lakukan hashing
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // Gabungkan data lama dengan data baru
    Object.assign(user, updateUserDto);

    const updatedUser = await this.usersRepository.save(user);
    return this.excludePassword(updatedUser);
  }

  /**
   * Menghapus pengguna dari database.
   * @param id - ID pengguna yang akan dihapus.
   * @returns Pesan sukses.
   */
  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id_user: id },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }

    // Hapus relasi user-roles terlebih dahulu
    user.roles = [];
    await this.usersRepository.save(user);
    
    // Kemudian hapus user
    const result = await this.usersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Gagal menghapus user dengan ID ${id}`);
    }
  }

  /**
   * Menambahkan role ke user
   * @param userId - ID user
   * @param roleId - ID role yang akan ditambahkan
   * @returns User yang sudah diperbarui
   */
  async addRoleToUser(userId: number, roleId: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id_user: userId },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
    }

    const role = await this.rolesRepository.findOne({
      where: { id_role: roleId },
    });
    
    if (!role) {
      throw new NotFoundException(`Role dengan ID ${roleId} tidak ditemukan`);
    }

    // Cek apakah user sudah memiliki role ini
    if (user.roles.some(r => r.id_role === roleId)) {
      throw new BadRequestException(`User sudah memiliki role ${role.nama_role}`);
    }

    user.roles.push(role);
    const updatedUser = await this.usersRepository.save(user);
    
    return this.excludePassword(updatedUser);
  }

  /**
   * Menghapus role dari user
   * @param userId - ID user
   * @param roleId - ID role yang akan dihapus
   * @returns User yang sudah diperbarui
   */
  async removeRoleFromUser(userId: number, roleId: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id_user: userId },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
    }

    // Cek apakah user memiliki role ini
    const roleIndex = user.roles.findIndex(r => r.id_role === roleId);
    if (roleIndex === -1) {
      throw new BadRequestException(`User tidak memiliki role dengan ID ${roleId}`);
    }

    user.roles.splice(roleIndex, 1);
    const updatedUser = await this.usersRepository.save(user);
    
    return this.excludePassword(updatedUser);
  }

  /**
   * Mendapatkan semua role yang dimiliki user
   * @param userId - ID user
   * @returns Daftar role user
   */
  async getUserRoles(userId: number): Promise<Role[]> {
    const user = await this.usersRepository.findOne({
      where: { id_user: userId },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
    }

    return user.roles;
  }
}