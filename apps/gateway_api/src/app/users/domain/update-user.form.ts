import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  validate,
} from 'class-validator';

export class UpdateUserForm {
  @ApiProperty({
    description: 'User\'s Email',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User\'s Password',
    example: 'qwerty09876',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User\'s first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'User\'s last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'User\'s refreshToken',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im15ZW1vQGdvaG9tZS5jb20iLCJzdWIiOiI2ZTRiMDc0Ny01ZDQxLTQwZTItODQ3Zi05OTViZGNjZjUzZjUiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcwNjAwODA1OCwiZXhwIjoxNzA2NjEyODU4fQ.HquajtGgup9WHoHpXXBaHImn5',
  })
  @IsOptional()
  @IsString()
  refreshToken: string;

  @ApiProperty({
    description: 'User\'s ROLE',
    example: 'USER',
  })
  @IsOptional()
  @IsEnum(Role)
  role: Role;

  static from(form?: UpdateUserForm) {
    const it = new UpdateUserForm();
    it.email = form?.email;
    it.password = form?.password;
    it.first_name = form?.first_name;
    it.last_name = form?.last_name;
    it.refreshToken = form?.refreshToken;
    it.role = form?.role;
    return it;
  }

  static async validate(form: UpdateUserForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
