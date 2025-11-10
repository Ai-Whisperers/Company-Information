import { Controller, Post, Get, Body, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { RepositoryMonitorService } from './repository-monitor.service';
import { RepositoryScanDto, BulkScanDto } from './dto/repository-scan.dto';

@Controller('api/repository-monitor')
export class RepositoryMonitorController {
  constructor(private readonly repositoryMonitorService: RepositoryMonitorService) {}

  @Post('scan')
  @HttpCode(HttpStatus.CREATED)
  async receiveScan(@Body() scanData: RepositoryScanDto) {
    return this.repositoryMonitorService.saveScan(scanData);
  }

  @Post('bulk-scan')
  @HttpCode(HttpStatus.CREATED)
  async receiveBulkScan(@Body() bulkData: BulkScanDto) {
    return this.repositoryMonitorService.saveBulkScans(bulkData);
  }

  @Get('health')
  async getHealthOverview() {
    return this.repositoryMonitorService.getHealthOverview();
  }

  @Get('repository/:name')
  async getRepositoryHealth(@Param('name') name: string) {
    return this.repositoryMonitorService.getRepositoryHealth(name);
  }

  @Get('alerts')
  async getAlerts(@Query('limit') limit?: number) {
    return this.repositoryMonitorService.getAlerts(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('trends/:name')
  async getRepositoryTrends(
    @Param('name') name: string,
    @Query('days') days?: number
  ) {
    return this.repositoryMonitorService.getRepositoryTrends(
      name,
      days ? parseInt(days.toString()) : 7
    );
  }

  @Get('summary')
  async getSummary() {
    return this.repositoryMonitorService.getSummary();
  }

  @Get('scans/latest')
  async getLatestScans(@Query('limit') limit?: number) {
    return this.repositoryMonitorService.getLatestScans(limit ? parseInt(limit.toString()) : 25);
  }

  @Get('scans/history')
  async getScanHistory(
    @Query('repository') repository?: string,
    @Query('days') days?: number,
    @Query('limit') limit?: number
  ) {
    return this.repositoryMonitorService.getScanHistory({
      repository,
      days: days ? parseInt(days.toString()) : 30,
      limit: limit ? parseInt(limit.toString()) : 100
    });
  }
}
