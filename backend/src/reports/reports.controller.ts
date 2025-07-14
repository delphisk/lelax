import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('api/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('statistics')
  async getPersonalStatistics(
    @CurrentUser('id') userId: number,
    @Query('fiscal_year') fiscalYear?: number
  ) {
    return this.reportsService.getPersonalStatistics(userId, fiscalYear);
  }

  @Get('summary')
  @Roles('hr', 'admin')
  async getOrganizationSummary(@Query('fiscal_year') fiscalYear?: number) {
    return this.reportsService.getOrganizationSummary(fiscalYear);
  }

  @Get('department/:departmentId')
  @Roles('supervisor', 'hr', 'admin')
  async getDepartmentReport(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Query('fiscal_year') fiscalYear?: number
  ) {
    return this.reportsService.getDepartmentReport(departmentId, fiscalYear);
  }

  @Get('user/:userId')
  @Roles('supervisor', 'hr', 'admin')
  async getUserReport(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('fiscal_year') fiscalYear?: number
  ) {
    return this.reportsService.getUserReport(userId, fiscalYear);
  }

  @Get('usage')
  @Roles('hr', 'admin')
  async getLeaveUsageReport(@Query('fiscal_year') fiscalYear?: number) {
    return this.reportsService.getLeaveUsageReport(fiscalYear);
  }

  @Get('my-profile')
  async getMyReport(
    @CurrentUser('id') userId: number,
    @Query('fiscal_year') fiscalYear?: number
  ) {
    return this.reportsService.getUserReport(userId, fiscalYear);
  }
}