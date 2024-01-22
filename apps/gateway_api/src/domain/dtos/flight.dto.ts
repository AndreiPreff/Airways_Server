import { Flight } from '@prisma/client';

export class FlightResponseDto {
  success: boolean;
  data?: Flight;
  error?: string;

  constructor(success: boolean, data?: Flight, error?: string) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static success(data: Flight): FlightResponseDto {
    return new FlightResponseDto(true, data);
  }

  static failure(error: string): FlightResponseDto {
    return new FlightResponseDto(false, undefined, error);
  }
}
