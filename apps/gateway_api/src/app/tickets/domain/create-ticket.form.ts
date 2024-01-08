import { Status } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  validateSync,
} from 'class-validator';

export class CreateTicketForm {
  @IsEnum(Status, { message: 'Invalid status value' })
  @IsOptional()
  status: Status;

  @IsOptional()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsUUID()
  flightId: string;

  @IsOptional()
  @IsUUID()
  orderId: string;

  static from(form?: CreateTicketForm) {
    const it = new CreateTicketForm();
    it.status = form?.status;
    it.amount = form?.amount;
    it.flightId = form?.flightId;
    it.orderId = form?.orderId;
    return it;
  }

  static validate(form: CreateTicketForm) {
    const errors = validateSync(form);
    return errors.length ? errors : false;
  }
}
