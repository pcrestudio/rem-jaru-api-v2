import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./core/exception-filters/all-exceptions.filter";
import { ConfigService } from "@nestjs/config";
import * as session from "express-session";
import * as passport from "passport";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get("FRONTEND_URL"),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  app.useGlobalFilters(new AllExceptionsFilter());

  // 1. Use session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "some_secret_key",
      resave: false, // do not rewrite session if unmodified
      saveUninitialized: false, // do not save new session if it is unmodified
    })
  );

  // 2. Initialize passport and passport session
  app.use(passport.initialize());
  app.use(passport.session());

  const port = configService.get<number>("PORT") || 8000;
  await app.listen(port);
}
bootstrap();
