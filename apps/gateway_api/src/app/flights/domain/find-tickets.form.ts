import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
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
}
