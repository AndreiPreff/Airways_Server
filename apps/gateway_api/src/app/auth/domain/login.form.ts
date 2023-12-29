import { IsEmail, IsNotEmpty, IsString, validate } from 'class-validator';

export class LoginForm {
  @IsNotEmpty()
  @IsEmail()
  email: string;

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
