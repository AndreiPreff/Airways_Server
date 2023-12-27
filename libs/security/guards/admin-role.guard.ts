import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import { EnumUserRoles } from "@prisma/client";
import {UserService} from "../../../app/user/user.service";

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    if (request?.user) {
      const user = await this.userService.getUser(request.user.id)
      return user.role === EnumUserRoles.ADMIN
    }
    return false
  }
}