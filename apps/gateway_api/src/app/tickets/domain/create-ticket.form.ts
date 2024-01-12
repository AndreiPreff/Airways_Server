import { IsNumber, IsUUID, validateSync } from 'class-validator';

export class CreateTicketForm {
  @IsNumber()
  amount: number;

  @IsUUID()
  flightId: string;

  static from(form?: CreateTicketForm) {
    const it = new CreateTicketForm();
    it.amount = form?.amount;
    it.flightId = form?.flightId;
    return it;
  }

  static validate(form: CreateTicketForm) {
    const errors = validateSync(form);
    return errors.length ? errors : false;
  }
}
