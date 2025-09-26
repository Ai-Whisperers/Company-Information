import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'org-os-jobs',
      version: '0.1.0',
    };
  }

  @Get()
  getRoot() {
    return {
      message: 'AI-Whisperers Org OS Jobs Service',
      docs: '/api',
      health: '/health',
    };
  }
}