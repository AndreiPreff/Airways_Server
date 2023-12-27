import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SecurityService {
  constructor(private readonly jwtService: JwtService) {}
  async generateTokens(userId: string) {
    const data = {id: userId}
    const accessToken = this.jwtService.sign(data, {
      expiresIn:'30m'
    })
    const refreshToken = this.jwtService.sign(data, {
      expiresIn:'30d'
    })
    return {accessToken, refreshToken}
  }

}
