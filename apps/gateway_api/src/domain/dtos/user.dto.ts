import { User, Role } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UUIDDto } from './uuid.dto';

export class UserDto extends UUIDDto {
  @IsEnum(Role)
  role: Role;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  refreshToken: string;

  static fromEntity(entity?: User) {
    if (!entity) {
      return;
    }
    const it = new UserDto();
    it.id = entity.id;
    it.createdAt = entity.createdAt.valueOf();
    it.updatedAt = entity.updatedAt.valueOf();
    it.role = entity.role;
    it.email = entity.email;
    it.password = entity.password;
    it.first_name = entity.first_name;
    it.last_name = entity.last_name;
    it.refreshToken = entity.refreshToken;
    return it;
  }

  static fromEntities(entities?: User[]) {
    if (!entities?.map) {
      return;
    }
    return entities.map((entity) => this.fromEntity(entity));
  }
}