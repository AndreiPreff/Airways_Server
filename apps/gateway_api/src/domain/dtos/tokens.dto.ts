import { IsOptional } from 'class-validator';

export class TokensDto {
  access_token: string;
  refresh_token: string;
  @IsOptional()
  role: string;
}
