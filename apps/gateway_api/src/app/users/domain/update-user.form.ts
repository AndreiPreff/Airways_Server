import {
  IsNotEmpty,
  MinLength,
  IsString,
  validate,
  IsEmail,
  IsEnum,
  IsOptional
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserForm {

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  refreshToken: string;

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