import { Status } from '@prisma/client';
import { IsString, validate } from 'class-validator';

export class UpdateOrderForm {
  @IsString()
  status: Status;

  static from(form?: UpdateOrderForm) {
    const it = new UpdateOrderForm();
    it.status = form?.status;
    return it;
  }

  static async validate(form: UpdateOrderForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
