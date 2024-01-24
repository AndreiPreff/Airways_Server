import { ApiProperty } from '@nestjs/swagger';

export class UUIDDto {
  @ApiProperty({
    description: 'The unique identifier (UUID) of the resource',
    example: '3e4d3b1b-5fc9-4a1b-839e-4b1f9d5dcb28',
  })
  id!: string;

  @ApiProperty({
    description: 'The timestamp when the resource was created',
    example: 1643356800000,
  })
  createdAt!: number;

  @ApiProperty({
    description: 'The timestamp when the resource was last updated',
    example: 1643360400000,
  })
  updatedAt!: number;
}
