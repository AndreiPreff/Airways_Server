import { IsEmail, IsNotEmpty, IsString, validate } from 'class-validator';

export class ResetPasswordForm {
  @IsNotEmpty()
  @IsEmail()
  email: string;

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
