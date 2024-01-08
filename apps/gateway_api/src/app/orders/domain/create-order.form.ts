// create-order.form.ts

import { Status } from '@prisma/client';
import { IsOptional, IsString, IsUUID, validate } from 'class-validator';

export class CreateOrderForm {
  @IsString()
  status: Status;

  @IsUUID()
  @IsOptional()
  id: string;

  static from(form?: CreateOrderForm) {
    const it = new CreateOrderForm();
    it.status = form?.status;
    return it;
  }

  static async validate(form: CreateOrderForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
