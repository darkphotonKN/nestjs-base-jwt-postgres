import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/shared/role.type';

export const ROLES_KEY = 'roles' as const;
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
