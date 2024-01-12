import { Status } from '@prisma/client';
import { IsEnum, validateSync } from 'class-validator';

export class UpdateTicketForm {
  @IsEnum(Status, { message: 'Invalid status value' })
  status: Status;

  static from(form?: UpdateTicketForm) {
    const it = new UpdateTicketForm();
    it.status = form?.status;
    return it;
  }

  static validate(form: UpdateTicketForm) {
    const errors = validateSync(form);
    return errors.length ? errors : false;
  }
}
