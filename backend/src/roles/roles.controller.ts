// backend/src/roles/roles.controller.ts
import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Role> {
    try {
      return await this.rolesService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() role: Partial<Role>): Promise<Role> {
    return this.rolesService.create(role);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() role: Partial<Role>): Promise<Role> {
    try {
      return await this.rolesService.update(+id, role);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.rolesService.remove(+id);
    } catch (error) {
      throw error;
    }
  }

  @Post(':roleId/permissions/:permissionId')
  async addPermissionToRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string
  ): Promise<Role> {
    try {
      return await this.rolesService.addPermissionToRole(+roleId, +permissionId);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':roleId/permissions/:permissionId')
  async removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string
  ): Promise<Role> {
    try {
      return await this.rolesService.removePermissionFromRole(+roleId, +permissionId);
    } catch (error) {
      throw error;
    }
  }
}