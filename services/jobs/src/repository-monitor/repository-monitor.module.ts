import { Module } from '@nestjs/common';
import { RepositoryMonitorController } from './repository-monitor.controller';
import { RepositoryMonitorService } from './repository-monitor.service';
import { PrismaService } from '../db/prisma.service';

@Module({
  controllers: [RepositoryMonitorController],
  providers: [RepositoryMonitorService, PrismaService],
  exports: [RepositoryMonitorService],
})
export class RepositoryMonitorModule {}
