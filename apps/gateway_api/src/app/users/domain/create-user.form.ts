import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserForm {
  @ApiProperty({
    description: 'User\'s Email',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User\'s Password',
    example: 'qwerty09876',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User\'s first name',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'User\'s last name',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  static from(form?: CreateUserForm) {
    const it = new CreateUserForm();
    it.email = form?.email;
    it.password = form?.password;
    it.first_name = form?.first_name;
    it.last_name = form?.last_name;
    return it;
  }
  static async validate(form: CreateUserForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
