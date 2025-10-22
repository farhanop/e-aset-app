// backend/src/roles/roles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  findAll(): Promise<Role[]> {
    return this.rolesRepository.find({ relations: ['permissions'] });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ 
      where: { id_role: id },
      relations: ['permissions']
    });
    
    if (!role) {
      throw new NotFoundException(`Role dengan ID ${id} tidak ditemukan`);
    }
    
    return role;
  }

  create(role: Partial<Role>): Promise<Role> {
    const newRole = this.rolesRepository.create(role);
    return this.rolesRepository.save(newRole);
  }

  async update(id: number, role: Partial<Role>): Promise<Role> {
    await this.rolesRepository.update(id, role);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.rolesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Role dengan ID ${id} tidak ditemukan`);
    }
  }

  async addPermissionToRole(roleId: number, permissionId: number): Promise<Role> {
    const role = await this.findOne(roleId);
    
    const permission = await this.permissionsRepository.findOne({
      where: { id_permission: permissionId }
    });
    
    if (!permission) {
      throw new NotFoundException(`Permission dengan ID ${permissionId} tidak ditemukan`);
    }

    // Cek apakah role sudah memiliki permission ini
    if (role.permissions.some(p => p.id_permission === permissionId)) {
      throw new BadRequestException(`Role sudah memiliki permission ini`);
    }

    role.permissions.push(permission);
    return this.rolesRepository.save(role);
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<Role> {
    const role = await this.findOne(roleId);
    
    // Cek apakah role memiliki permission ini
    const permissionIndex = role.permissions.findIndex(p => p.id_permission === permissionId);
    if (permissionIndex === -1) {
      throw new BadRequestException(`Role tidak memiliki permission ini`);
    }

    role.permissions.splice(permissionIndex, 1);
    return this.rolesRepository.save(role);
  }
}