import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "src/core/database/prisma.module";
import { APP_FILTER } from "@nestjs/core";
import { HttpExceptionFilters } from "./core/exception-filters/http-exception.filters";
import { RolesModule } from "src/modules/roles/roles.module";
import { AuthMiddleware } from "./common/middleware/auth.middleware";
import { ModuleModule } from "./modules/module/module.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    RolesModule,
    ModuleModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilters,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude("auth/(.*)").forRoutes("*");
  }
}
