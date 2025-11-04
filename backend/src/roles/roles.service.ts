// src/roles/roles.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // --- CRUD untuk Peran (Roles) ---

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const newRole = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(newRole);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Role[], total: number }> {
    const [data, total] = await this.roleRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return { data, total };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id_role: id },
    });
    
    if (!role) {
      throw new NotFoundException(`Peran dengan ID ${id} tidak ditemukan`);
    }

    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id_role: id },
    });
    
    if (!role) {
      throw new NotFoundException(`Peran dengan ID ${id} tidak ditemukan`);
    }

    await this.roleRepository.remove(role);
  }

  // --- Logika untuk Izin (Permissions) ---

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findPermissionsByRoleId(id: number): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id_role: id },
      relations: ['permissions'], // Mengambil relasi izin
    });
    if (!role) {
      throw new NotFoundException(`Peran dengan ID ${id} tidak ditemukan`);
    }
    return role.permissions;
  }

  async updatePermissionsForRole(
    id: number,
    updateDto: UpdateRolePermissionsDto,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id_role: id },
      relations: ['permissions'],
    });
    
    if (!role) {
      throw new NotFoundException(`Peran dengan ID ${id} tidak ditemukan`);
    }

    // Validasi permission IDs
    const permissions = await this.permissionRepository.findBy({
      id_permission: In(updateDto.permissionIds),
    });

    if (permissions.length !== updateDto.permissionIds.length) {
      throw new BadRequestException('Beberapa ID permission tidak valid');
    }

    role.permissions = permissions;
    return this.roleRepository.save(role);
  }
}