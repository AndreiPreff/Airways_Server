import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validate,
} from 'class-validator';

export class FindTicketsForm {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  departureDate: Date;

  @IsNotEmpty()
  @Min(0)
  maxStops: number;

  @IsNotEmpty()
  @IsBoolean()
  roundTrip: boolean;

  @IsOptional()
  returnDate?: Date;

  @IsNotEmpty()
  ticketsAmount: number;

  static from(form?: FindTicketsForm) {
    const it = new FindTicketsForm();
    it.from = form?.from;
    it.to = form?.to;
    it.departureDate = form?.departureDate;
    it.maxStops = form?.maxStops;
    it.roundTrip = form?.roundTrip;
    it.returnDate = form?.returnDate;
    it.ticketsAmount = form?.ticketsAmount;
    return it;
  }

  static async validate(form: FindTicketsForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
