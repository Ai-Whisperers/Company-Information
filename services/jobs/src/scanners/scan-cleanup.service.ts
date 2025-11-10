import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../db/prisma.service';

/**
 * Scan Cleanup Service
 * Manages retention policy for RepositoryScan table to prevent unbounded growth
 *
 * Retention Policy:
 * - Keep all scans from last 90 days
 * - Delete scans older than 90 days
 * - Runs daily at 2 AM to minimize impact
 */
@Injectable()
export class ScanCleanupService {
  private readonly logger = new Logger(ScanCleanupService.name);
  private readonly DEFAULT_RETENTION_DAYS = 90;

  constructor(private prisma: PrismaService) {}

  /**
   * Scheduled cleanup job - runs daily at 2 AM
   * Configurable via SCAN_RETENTION_DAYS environment variable
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldScans() {
    const retentionDays = parseInt(process.env.SCAN_RETENTION_DAYS || String(this.DEFAULT_RETENTION_DAYS));

    this.logger.log(`Starting scan cleanup (retention: ${retentionDays} days)`);
    const startTime = Date.now();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Delete old scans
      const result = await this.prisma.repositoryScan.deleteMany({
        where: {
          scanTimestamp: {
            lt: cutoffDate,
          },
        },
      });

      const duration = Math.round((Date.now() - startTime) / 1000);

      this.logger.log(
        `Cleanup completed: ${result.count} scans deleted (older than ${cutoffDate.toISOString()}) in ${duration}s`
      );

      // Log cleanup operation
      await this.prisma.syncLog.create({
        data: {
          syncType: 'SCAN_CLEANUP',
          status: 'COMPLETED',
          itemsProcessed: result.count,
          itemsFailed: 0,
          startedAt: new Date(startTime),
          completedAt: new Date(),
          duration,
          details: JSON.stringify({
            retentionDays,
            cutoffDate: cutoffDate.toISOString(),
            deletedCount: result.count,
          }),
        },
      });

      return {
        success: true,
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString(),
        retentionDays,
      };
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`, error.stack);

      await this.prisma.syncLog.create({
        data: {
          syncType: 'SCAN_CLEANUP',
          status: 'FAILED',
          errorMessage: error.message,
          startedAt: new Date(startTime),
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Manual cleanup trigger (for testing or admin operations)
   * @param retentionDays Optional custom retention period
   */
  async manualCleanup(retentionDays?: number) {
    if (retentionDays) {
      const originalValue = process.env.SCAN_RETENTION_DAYS;
      process.env.SCAN_RETENTION_DAYS = String(retentionDays);
      const result = await this.cleanupOldScans();
      if (originalValue) {
        process.env.SCAN_RETENTION_DAYS = originalValue;
      }
      return result;
    }
    return this.cleanupOldScans();
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats() {
    const retentionDays = parseInt(process.env.SCAN_RETENTION_DAYS || String(this.DEFAULT_RETENTION_DAYS));
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const [totalScans, oldScans, recentCleanup] = await Promise.all([
      this.prisma.repositoryScan.count(),
      this.prisma.repositoryScan.count({
        where: {
          scanTimestamp: { lt: cutoffDate },
        },
      }),
      this.prisma.syncLog.findFirst({
        where: { syncType: 'SCAN_CLEANUP' },
        orderBy: { completedAt: 'desc' },
      }),
    ]);

    return {
      total_scans: totalScans,
      scans_eligible_for_deletion: oldScans,
      retention_days: retentionDays,
      cutoff_date: cutoffDate.toISOString(),
      last_cleanup: recentCleanup ? {
        completed_at: recentCleanup.completedAt,
        items_processed: recentCleanup.itemsProcessed,
        status: recentCleanup.status,
      } : null,
    };
  }
}
