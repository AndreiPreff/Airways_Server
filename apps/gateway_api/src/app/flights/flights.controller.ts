import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { Public } from 'libs/security/decorators/public.decorator';
import { FindTicketsForm } from './domain/find-tickets.form';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Public()
  @Get('/available-tickets')
  async getAvailableTickets(
    @Query(new ValidationPipe()) formData: FindTicketsForm,
  ) {
    console.log('try');
    try {
      // Вызываем метод сервиса для получения доступных билетов
      const availableTickets =
        await this.flightsService.findAvailableTickets(formData);

      // Отправляем результат на фронтенд
      return { success: true, data: availableTickets };
    } catch (error) {
      // Обрабатываем ошибки и отправляем сообщение об ошибке на фронтенд
      return { success: false, error: error.message };
    }
  }
}
