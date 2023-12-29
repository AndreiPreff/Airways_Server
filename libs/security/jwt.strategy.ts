import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepo } from 'apps/gateway_api/src/domain/repos/users.repo';
import { UserSessionDto } from 'apps/gateway_api/src/domain/dtos/user-session.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersRepo: UsersRepo) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET,
    });
  }

  async validate(payload: UserSessionDto) {
    const user = await this.usersRepo.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}