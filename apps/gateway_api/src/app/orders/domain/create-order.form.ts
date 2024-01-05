// create-order.form.ts

import { Status } from '@prisma/client';
import { IsNumber, IsString, validate } from 'class-validator';

export class CreateOrderForm {
  @IsNumber()
  order_total: number;

  @IsString()
  status: Status;

  static from(form?: CreateOrderForm) {
    const it = new CreateOrderForm();
    it.order_total = form?.order_total;
    it.status = form?.status;
    return it;
  }

  static async validate(form: CreateOrderForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
