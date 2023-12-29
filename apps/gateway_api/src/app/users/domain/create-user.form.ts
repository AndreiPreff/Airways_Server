import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  validate,
} from 'class-validator';

export class CreateUserForm {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

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
