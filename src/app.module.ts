import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "src/modules/auth/auth.module";
import { PrismaModule } from "src/core/database/prisma.module";
import { APP_FILTER } from "@nestjs/core";
import { HttpExceptionFilters } from "./core/exception-filters/http-exception.filters";
import { RolesModule } from "src/modules/roles/roles.module";
import { AuthMiddleware } from "./common/middleware/auth.middleware";
import { ModuleModule } from "./modules/module/module.module";
import { JudicialProcessModule } from "./modules/judicial_process/judicial-process.module";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { MasterModule } from "./modules/master/master.module";
import { AttributeValuesModule } from "./modules/attribute_values/attribute-values.module";
import { MulterModule } from "@nestjs/platform-express";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    RolesModule,
    ModuleModule,
    JudicialProcessModule,
    AttributeValuesModule,
    PrismaModule,
    MasterModule,
    MulterModule.register({
      dest: "./uploads",
    }),
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        node: configService.get("ELASTICSEARCH_NODE"),
        maxRetries: configService.get("ELASTICSEARCH_MAX_RETRIES"),
        requestTimeout: configService.get("ELASTICSEARCH_REQ_TIMEOUT"),
      }),
      inject: [ConfigService],
    }),
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
