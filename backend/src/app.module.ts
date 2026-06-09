import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ServiceModule } from './service/service.module';
import { MedicalRecordModule } from './medical-record/medical-record.module';
import { ConsultationModule } from './consultation/consultation.module';
import { AreaModule } from './area/area.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PrismaModule,
    AuthModule,
    ServiceModule,
    MedicalRecordModule,
    ConsultationModule,
    AreaModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ...(process.env.NODE_ENV === 'production'
      ? []
      : [
          {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
          },
        ]),
  ],
})
export class AppModule {}
