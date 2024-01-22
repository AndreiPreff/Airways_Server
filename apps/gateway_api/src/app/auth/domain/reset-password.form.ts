import { IsEmail, IsNotEmpty, IsString, validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordForm {
  @ApiProperty({
    description: 'User Email',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'newSecurePassword123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  static from(form?: ResetPasswordForm) {
    const instance = new ResetPasswordForm();
    instance.password = form?.password;
    instance.email = form?.email;
    return instance;
  }

  static async validate(form: ResetPasswordForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
