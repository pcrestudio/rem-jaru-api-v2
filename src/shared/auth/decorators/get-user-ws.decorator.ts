import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const GetUserWs = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const client = ctx.switchToWs().getClient();

  const user = client.data.user;

  if (data && user) {
    return user[data];
  }
  return user;
});
