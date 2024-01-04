import { IsDate, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class FindTicketsForm {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsDate()
  departureDate: Date;

  @IsNotEmpty()
  @Min(0)
  maxStops: number; // Количество пересадок (0, 1, 2)

  @IsNotEmpty()
  roundTrip: boolean; // Нужны ли билеты туда-назад

  @IsOptional()
  @IsDate()
  returnDate?: Date; // Дата обратного пути (может быть не указана, если roundTrip === false)
}
