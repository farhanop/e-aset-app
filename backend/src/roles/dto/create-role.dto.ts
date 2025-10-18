// src/roles/dto/create-role.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  nama_role: string;

  @IsString()
  @IsOptional()
  deskripsi?: string;
}

// update-role-permissions.dto.ts
import { IsArray, IsNumber } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}