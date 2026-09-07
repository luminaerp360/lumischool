import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule } from "@nestjs/throttler";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { BullModule } from "@nestjs/bull";
import { ScheduleModule } from "@nestjs/schedule";
import { envValidationSchema } from "./config/env.validation";

// Core Modules
import { AuthModule } from "./modules/auth/auth.module";
import { TenantsModule } from "./modules/tenants/tenants.module";

// Feature Modules
import { UsersModule } from "./modules/users/users.module";
import { StudentsModule } from "./modules/students/students.module";
import { GuardiansModule } from "./modules/guardians/guardians.module";
import { ClassesModule } from "./modules/classes/classes.module";
import { AcademicsModule } from "./modules/academics/academics.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { ExamsModule } from "./modules/exams/exams.module";
import { CommunicationModule } from "./modules/communication/communication.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { AuditModule } from "./modules/audit/audit.module";

// Integration Modules
import { MpesaModule } from "./modules/integrations/mpesa/mpesa.module";
import { SmsModule } from "./modules/integrations/sms/sms.module";

@Module({
  imports: [
    // Global Config with Joi validation
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
        retryAttempts: Number.MAX_SAFE_INTEGER,
        retryDelay: 10000,
        connectionFactory: (connection) => {
          connection.on("connected", () => {
            console.info("MongoDB connected successfully");
          });
          connection.on("disconnected", () => {
            console.info("MongoDB disconnected! Attempting to reconnect...");
          });
          connection.on("error", (error) => {
            console.error("MongoDB connection error:", error.message);
          });
          return connection;
        },
      }),
    }),

    // BullMQ for background jobs (SMS, report generation, etc.)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          redis: configService.get<string>("REDIS_URL") as any,
        }) as any,
    }),

    // Event Emitter for audit logs and async events
    EventEmitterModule.forRoot({ global: true }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    TenantsModule,
    UsersModule,
    StudentsModule,
    GuardiansModule,
    ClassesModule,
    AcademicsModule,
    AttendanceModule,
    FinanceModule,
    ExamsModule,
    CommunicationModule,
    ReportsModule,
    AuditModule,
    MpesaModule,
    SmsModule,
  ],
})
export class AppModule {}
