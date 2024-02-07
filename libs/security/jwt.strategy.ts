import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserSessionDto } from 'apps/gateway_api/src/domain/dtos/user-session.dto';
import { UsersRepo } from 'apps/gateway_api/src/domain/repos/users.repo';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersRepo: UsersRepo) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET,
    });
  }

  async validate(payload: UserSessionDto) {
    const user = await this.usersRepo.findById({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
