import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (data && request.user) {
    return request.user[data];
  }
  return request.user;
});
