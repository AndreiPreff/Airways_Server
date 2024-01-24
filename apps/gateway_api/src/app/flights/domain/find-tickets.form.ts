import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindTicketsForm {
  @ApiProperty({
    description: 'Departure location',
    example: 'New York',
  })
  @IsNotEmpty()
  @IsString()
  from: string;

  @ApiProperty({
    description: 'Destination location',
    example: 'Los Angeles',
  })
  @IsNotEmpty()
  @IsString()
  to: string;

  @ApiProperty({
    description: 'Date of departure',
    example: '2024-05-20',
    type: 'string',
    format: 'date-time'
  })
  @IsNotEmpty()
  departureDate: Date;

  @ApiProperty({
    description: 'Maximum number of stops allowed',
    example: 2,
    minimum: 0
  })
  @IsNotEmpty()
  @Min(0)
  maxStops: number;

  @ApiProperty({
    description: 'Indicates if the trip is a round trip',
    example: true
  })
  @IsNotEmpty()
  @IsBoolean()
  roundTrip: boolean;

  @ApiProperty({
    description: 'Return date for a round trip (optional)',
    example: '2024-05-27',
    type: 'string',
    format: 'date-time',
    required: false
  })
  @IsOptional()
  returnDate?: Date;

  @ApiProperty({
    description: 'Quantity of tickets',
    example: 1,
  })
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
