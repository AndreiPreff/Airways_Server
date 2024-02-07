import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketForm {
  @ApiProperty({
    description: 'Array of flight IDs for the outbound journey',
    example: ['12345', '6789'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one flightId must be provided' })
  flightIdThere: string[];

  @ApiProperty({
    description: 'Array of flight IDs for the return journey (optional)',
    example: ['67890', '12345'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one flightId must be provided' })
  flightIdBack: string[];

  @ApiProperty({
    description: 'Passenger\'s first name',
    example: 'John',
  })
  @IsString()
  passengerName: string;

  @ApiProperty({
    description: 'Passenger\'s last name',
    example: 'Doe',
  })
  @IsString()
  passengerLastName: string;

  @ApiProperty({
    description: 'Passenger\'s passport number',
    example: 'A12345678',
  })
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
