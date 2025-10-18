// src/roles/roles.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Create role baru
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  // Ambil semua role dengan pagination
  @Get()
  findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.rolesService.findAll(page, limit);
  }

  // Ambil semua permission
  @Get('permissions')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  // Ambil permission sebuah role
  @Get(':id/permissions')
  findPermissionsByRoleId(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findPermissionsByRoleId(id);
  }

  // Update permission role
  @Put(':id/permissions')
  updatePermissionsForRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRolePermissionsDto,
  ) {
    return this.rolesService.updatePermissionsForRole(id, updateDto);
  }

  // Update data role (nama, deskripsi)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  // Delete role
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
