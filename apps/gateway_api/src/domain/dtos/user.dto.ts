import { Role, User } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UUIDDto } from './uuid.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto extends UUIDDto {
  @ApiProperty({
    description: 'The role of the user',
    enum: Role,
    example: 'MANAGER',
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: 'User\'s email',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user (minimum length 8 characters)',
    example: 'password123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'The refresh token for the user',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
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
