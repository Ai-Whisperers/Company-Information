import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './db/prisma.module';
import { ScannersModule } from './scanners/scanners.module';
import { SyncModule } from './sync/sync.module';
import { ReportersModule } from './reporters/reporters.module';
import { ReportsModule } from './reports/reports.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    ScannersModule,
    SyncModule,
    ReportersModule,
    ReportsModule,
    IntegrationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}