import { SetMetadata } from '@nestjs/common';
import { RolesUsuario } from '../../enums/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesUsuario[]) => SetMetadata(ROLES_KEY, roles);