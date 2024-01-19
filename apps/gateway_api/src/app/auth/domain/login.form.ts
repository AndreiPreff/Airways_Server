import { IsEmail, IsNotEmpty, IsString, validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginForm {
  @ApiProperty({
    description: 'User Email',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User Password',
    example: 'qwerty09876',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  static from(form?: LoginForm) {
    const it = new LoginForm();
    it.email = form?.email;
    it.password = form?.password;
    return it;
  }

  static async validate(form: LoginForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
