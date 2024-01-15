import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export class CreateTicketForm {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one flightId must be provided' })
  flightIdThere: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one flightId must be provided' })
  flightIdBack: string[];

  @IsString()
  passengerName: string;

  @IsString()
  passengerLastName: string;

  @IsString()
  passengerPassportNumber: string;

  static from(form?: CreateTicketForm) {
    const it = new CreateTicketForm();
    it.flightIdThere = form?.flightIdThere;
    it.flightIdBack = form?.flightIdBack;
    it.passengerName = form?.passengerName;
    it.passengerLastName = form?.passengerLastName;
    it.passengerPassportNumber = form?.passengerPassportNumber;
    return it;
  }

  static validate(form: CreateTicketForm) {
    const errors = validateSync(form);
    return errors.length ? errors : false;
  }
}
