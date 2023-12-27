import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { UsersRepo } from "domain/repos/users.repo";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{
  constructor(
    private configService: ConfigService,
    private usersRepo: UsersRepo
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET')
    })
  }
  async validate({id}: Pick<User, 'id'>) {
    return this.usersRepo.getUserById(id)
  }
}