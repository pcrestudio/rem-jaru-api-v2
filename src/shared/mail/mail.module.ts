import { DynamicModule, Module } from "@nestjs/common";
import { MailService } from "./mail.service";

// @Module({
//   imports: [],
//   providers: [MailService],
// })
// export class MailModule {}

@Module({})
export class MailModule {
  static register(): DynamicModule {
    return {
      module: MailModule,
      providers: [MailService],
      exports: [MailService],
    };
  }
}
