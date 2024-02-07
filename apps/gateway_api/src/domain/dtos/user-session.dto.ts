import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserSessionDto {
  @ApiProperty({
    description: 'User\'s email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The sub (subject) identifier of the user',
    example: '1234567890',
  })
  sub: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: Role,
    example: 'MANAGER',
  })
  role: Role;

  @ApiProperty({
    description: 'The refresh token for the user session (optional)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;
}
