import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

// Tipe gabungan untuk parameter DTO di fungsi update
type UpdateDtoUnion =
  | Partial<UpdateUserDto & UpdateProfileDto>
  | { password?: string };

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Helper untuk menghapus password dari objek user
   */
  private excludePassword(
    user: User | null | undefined,
  ): Omit<User, 'password'> | undefined {
    if (!user) {
      return undefined;
    }
    const { password, ...result } = user;
    return result;
  }

  /**
   * Helper untuk melakukan hash pada password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  /**
   * Membuat pengguna baru
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Pastikan DTO Anda memiliki 'nomor_telepon' jika digunakan di sini
    const {
      username,
      email,
      password,
      nama_lengkap,
      role /*, nomor_telepon */,
    } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      if (existingUser.username === username)
        throw new ConflictException('Username sudah terdaftar');
      if (existingUser.email === email)
        throw new ConflictException('Email sudah terdaftar');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      nama_lengkap,
      status: 'aktif',
      role: role || 'staff',
      // nomor_telepon, // <-- Aktifkan jika ada di DTO
    });
    const savedUser = await this.usersRepository.save(user);
    return this.excludePassword(savedUser)!;
  }

  /**
   * Mengambil semua pengguna (pagination)
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Omit<User, 'password'>[]; total: number }> {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id_user: 'ASC' },
    });
    const usersWithoutPassword = users.map(
      (user) => this.excludePassword(user)!,
    );
    return { data: usersWithoutPassword, total };
  }

  /**
   * Mencari satu pengguna berdasarkan username (Tanpa Password)
   */
  async findOne(username: string): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return this.excludePassword(user);
  }

  /**
   * Mencari satu pengguna berdasarkan ID (Tanpa Password)
   */
  async findOneById(id: number): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.usersRepository.findOne({ where: { id_user: id } });
    return this.excludePassword(user);
  }

  /**
   * Mencari satu pengguna berdasarkan email (Tanpa Password)
   */
  async findOneByEmail(
    email: string,
  ): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return this.excludePassword(user);
  }

  /**
   * Mencari satu pengguna berdasarkan ID (Termasuk Password)
   */
  async findOneByIdWithPassword(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { id_user: id },
      select: ['id_user', 'username', 'password', 'role'],
    });
    return user ?? undefined;
  }

  /**
   * Mencari satu pengguna berdasarkan username (Termasuk Password)
   */
  async findOneByUsername(username: string): Promise<User | undefined> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id_user',
        'user.username',
        'user.email',
        'user.nama_lengkap',
        'user.status',
        'user.nomor_telepon',
        'user.foto_profil',
        'user.role',
      ])
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
    return user ?? undefined;
  }

  /**
   * Memperbarui data pengguna.
   */
  async update(
    id: number,
    updateUserDto: UpdateDtoUnion,
  ): Promise<Omit<User, 'password'>> {
    console.log(`🔄 Service: update called for userId: ${id}`);
    console.log('📄 DTO received for update:', updateUserDto);

    const currentUser = await this.usersRepository.findOne({
      where: { id_user: id },
    });
    if (!currentUser) {
      console.error(`❌ User with ID ${id} not found.`);
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }
    console.log('👤 Current user data fetched:', {
      id: currentUser.id_user,
      email: currentUser.email,
      username: currentUser.username,
    });

    // Cek konflik USERNAME
    if (
      'username' in updateUserDto &&
      updateUserDto.username &&
      updateUserDto.username !== currentUser.username
    ) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUser && existingUser.id_user !== id) {
        throw new ConflictException(
          'Username sudah digunakan oleh pengguna lain',
        );
      }
    }

    // Cek konflik EMAIL
    if (
      'email' in updateUserDto &&
      updateUserDto.email &&
      updateUserDto.email !== currentUser.email
    ) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id_user !== id) {
        throw new ConflictException('Email sudah digunakan oleh pengguna lain');
      }
    }

    // Siapkan data untuk diupdate
    let dataToUpdate: Partial<User> = {};

    // 🔧 PERBAIKAN: Hapus 'status' dari allowedFields jika tidak ada di DTO 🔧
    type UpdateKeys = keyof (UpdateUserDto & UpdateProfileDto);
    const allowedFields: UpdateKeys[] = [
      'nama_lengkap',
      'email',
      'nomor_telepon',
      'foto_profil',
      /* 'status', */ 'role', // Hapus 'status' jika tidak ada di DTO gabungan
    ];

    for (const key of allowedFields) {
      if (key in updateUserDto && updateUserDto[key] !== undefined) {
        dataToUpdate[key as keyof Partial<User>] = updateUserDto[key];
      }
    }

    // Handle password terpisah
    if ('password' in updateUserDto && updateUserDto.password) {
      dataToUpdate.password = await this.hashPassword(updateUserDto.password);
    }

    // Handle foto_profil="" (penghapusan foto) secara eksplisit
    if ('foto_profil' in updateUserDto && updateUserDto.foto_profil === '') {
      dataToUpdate.foto_profil = ''; // Pastikan string kosong dikirim untuk update
    }

    // Jika tidak ada data valid untuk diupdate, return user saat ini
    if (Object.keys(dataToUpdate).length === 0) {
      console.log('ℹ️ No valid fields to update.');
      return this.excludePassword(currentUser)!;
    }

    console.log('💾 Data prepared for repository.update:', dataToUpdate);

    const updateResult = await this.usersRepository.update(id, dataToUpdate);

    if (updateResult.affected === 0) {
      console.error(`❌ Update failed for user ID ${id}. No rows affected.`);
      throw new NotFoundException(
        `Gagal memperbarui user dengan ID ${id}, user mungkin tidak ditemukan.`,
      );
    }
    console.log(
      `✅ Update successful for user ID ${id}. Affected rows: ${updateResult.affected}`,
    );

    const updatedUser = await this.usersRepository.findOne({
      where: { id_user: id },
    });
    if (!updatedUser) {
      console.error(`❌ Failed to retrieve user ID ${id} after update.`);
      throw new Error('Gagal mengambil data user setelah update.');
    }
    console.log('📤 Returning updated user data (excluding password).');
    return this.excludePassword(updatedUser)!;
  }

  /**
   * Menghapus pengguna
   */
  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id_user: id } });
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Gagal menghapus user dengan ID ${id}, mungkin sudah dihapus.`,
      );
    }
    console.log(`✅ User with ID ${id} deleted successfully.`);
  }

  /**
   * Mengubah role user
   */
  async changeUserRole(
    userId: number,
    role: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id_user: userId },
    });
    if (!user) {
      throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
    }
    const validRoles = ['super-admin', 'admin', 'staff']; // Sesuaikan
    if (!validRoles.includes(role)) {
      throw new BadRequestException(
        `Role tidak valid. Role yang tersedia: ${validRoles.join(', ')}`,
      );
    }
    user.role = role;
    const updatedUser = await this.usersRepository.save(user);
    console.log(`✅ Role for user ID ${userId} changed to "${role}".`);
    return this.excludePassword(updatedUser)!;
  }

  /**
   * Mendapatkan role user
   */
  async getUserRole(userId: number): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { id_user: userId },
      select: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
    }
    return user.role;
  }
}
