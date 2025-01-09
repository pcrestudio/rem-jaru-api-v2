import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./shared/auth/auth.module";
import { PrismaModule } from "src/core/database/prisma.module";
import { APP_FILTER } from "@nestjs/core";
import { HttpExceptionFilters } from "./core/exception-filters/http-exception.filters";
import { RolesModule } from "src/modules/roles/roles.module";
import { ModuleModule } from "./modules/module/module.module";
import { JudicialProcessModule } from "./modules/judicial_process/judicial-process.module";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { MasterModule } from "./modules/master/master.module";
import { AttributeValuesModule } from "./modules/attribute_values/attribute-values.module";
import { MulterModule } from "@nestjs/platform-express";
import { TodoModule } from "./modules/todo/todo.module";
import { InstanceModule } from "./modules/instance/instance.module";
import { join } from "path";
import { diskStorage } from "multer";
import { SupervisionModule } from "./modules/supervision/supervision.module";
import { CejModule } from "./modules/cej/cej.module";
import { ReportModule } from "./modules/report/report.module";
import { OtpModule } from "./shared/otp/otp.module";
import { UsersModule } from "./shared/users/users.module";
import { APP_GUARD } from "@nestjs/core";
import { GlobalJwtAuthGuard } from "./shared/auth/guards/global-jwt.guard";
import { MailModule } from "./shared/mail/mail.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MailModule.register(),
    AuthModule,
    OtpModule,
    UsersModule,
    RolesModule,
    ModuleModule,
    CejModule,
    JudicialProcessModule,
    SupervisionModule,
    AttributeValuesModule,
    PrismaModule,
    ReportModule,
    MasterModule,
    TodoModule,
    InstanceModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(__dirname, "..", "..", "upload");
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueSuffix);
        },
      }),
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
    {
      provide: APP_GUARD,
      useClass: GlobalJwtAuthGuard,
    },
  ],
})
export class AppModule {}
