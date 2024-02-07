import { Status } from '@prisma/client';
import { IsString, validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderForm {
  @ApiProperty({
    description: 'Order status',
    example: Status.BOOKED,
    enum: Status,
  })
  @IsString()
  status: Status;

  static from(form?: UpdateOrderForm) {
    const it = new UpdateOrderForm();
    it.status = form?.status;
    return it;
  }

  static async validate(form: UpdateOrderForm) {
    const errors = await validate(form);
    return errors.length ? errors : false;
  }
}
