import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { GlobalHttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseTransformInterceptor } from "./common/interceptors/response-transform.interceptor";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // CORS
  const frontendUrl = configService.get<string>(
    "FRONTEND_URL",
    "http://localhost:4200",
  );
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix("api");

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle("LumiSchool API")
    .setDescription("Multi-tenant SaaS School Management System API for Kenya")
    .setVersion("1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token",
    )
    .addTag("Auth", "Authentication & user management")
    .addTag("Tenants", "Multi-tenant school management")
    .addTag("Students", "Student registration & profiles")
    .addTag("Guardians", "Parent/guardian management")
    .addTag("Classes", "CBC class structure")
    .addTag("Academics", "CBC competency assessments")
    .addTag("Attendance", "Student & staff attendance")
    .addTag("Finance", "Fee structures, invoices, payments")
    .addTag("MPESA", "MPESA Daraja integration")
    .addTag("SMS", "SMS notifications")
    .addTag("Exams", "Exams & report cards")
    .addTag("Audit", "Audit logs")
    .addTag("Communication", "Announcements & notifications")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = configService.get<number>("PORT", 3400);
  await app.listen(port);
  logger.log(`LumiSchool API running on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/docs`);
  logger.log(
    `Environment: ${configService.get<string>("NODE_ENV", "development")}`,
  );
}
bootstrap();
