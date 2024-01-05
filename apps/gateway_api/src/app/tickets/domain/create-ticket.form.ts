import { Status } from '@prisma/client';
import { IsEnum, IsNumber, IsUUID, validate } from 'class-validator';

export class CreateTicketForm {
  @IsEnum(Status, { message: 'Invalid status value' })
  status: Status;

  @IsNumber()
  price: number;

  @IsNumber()
  amount: number;

  @IsUUID()
  flightId: string;

  @IsUUID()
  orderId: string;

  static from(form?: CreateTicketForm) {
    const it = new CreateTicketForm();
    it.status = form?.status;
    it.price = form?.price;
    it.amount = form?.amount;
    it.orderId = form?.orderId;
    return it;
  }

  static async validate(form: CreateTicketForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
