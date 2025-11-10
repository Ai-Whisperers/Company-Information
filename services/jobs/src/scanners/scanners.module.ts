import { Module } from '@nestjs/common';
import { GitHubHealthScanner } from './github-health.scanner';
import { DocsCheckScanner } from './docs-check.scanner';
import { ScanCleanupService } from './scan-cleanup.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [IntegrationsModule],
  providers: [GitHubHealthScanner, DocsCheckScanner, ScanCleanupService],
  exports: [GitHubHealthScanner, DocsCheckScanner, ScanCleanupService],
})
export class ScannersModule {}