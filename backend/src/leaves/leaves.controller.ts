import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveLeaveRequestDto,
  LeaveRequestFilterDto,
  UpdateLeaveBalanceDto,
} from '../common/dto/leave.dto';

@Controller('api/leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private leavesService: LeavesService) {}

  // Leave Types
  @Get('types')
  async getLeaveTypes() {
    return this.leavesService.getLeaveTypes();
  }

  // Fiscal Years
  @Get('fiscal-years')
  async getFiscalYears() {
    return this.leavesService.getFiscalYears();
  }

  @Get('fiscal-years/current')
  async getCurrentFiscalYear() {
    return this.leavesService.getCurrentFiscalYear();
  }

  // Leave Balances
  @Get('balance')
  async getMyLeaveBalance(
    @CurrentUser('id') userId: number,
    @Query('fiscal_year_id') fiscalYearId?: number
  ) {
    return this.leavesService.getLeaveBalance(userId, fiscalYearId);
  }

  @Get('balance/:userId')
  @Roles('supervisor', 'hr', 'admin')
  async getUserLeaveBalance(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('fiscal_year_id') fiscalYearId?: number
  ) {
    return this.leavesService.getLeaveBalance(userId, fiscalYearId);
  }

  @Put('balance')
  @Roles('hr', 'admin')
  async updateLeaveBalance(@Body(ValidationPipe) updateDto: UpdateLeaveBalanceDto) {
    return this.leavesService.updateLeaveBalance(updateDto);
  }

  // Leave Requests
  @Get('requests')
  async getLeaveRequests(
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
    @Query() filters: LeaveRequestFilterDto
  ) {
    // If user is employee, only show their own requests
    const requestUserId = ['supervisor', 'hr', 'admin'].includes(userRole) ? undefined : userId;
    return this.leavesService.getLeaveRequests(filters, requestUserId);
  }

  @Get('requests/my')
  async getMyLeaveRequests(
    @CurrentUser('id') userId: number,
    @Query() filters: LeaveRequestFilterDto
  ) {
    return this.leavesService.getLeaveRequests(filters, userId);
  }

  @Get('requests/pending-approvals')
  @Roles('supervisor', 'hr', 'admin')
  async getPendingApprovals(@CurrentUser('id') userId: number) {
    return this.leavesService.getPendingApprovals(userId);
  }

  @Get('requests/:id')
  async getLeaveRequest(@Param('id', ParseIntPipe) id: number) {
    return this.leavesService.getLeaveRequestById(id);
  }

  @Post('requests')
  async createLeaveRequest(
    @CurrentUser('id') userId: number,
    @Body(ValidationPipe) createDto: CreateLeaveRequestDto
  ) {
    return this.leavesService.createLeaveRequest(userId, createDto);
  }

  @Put('requests/:id')
  async updateLeaveRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body(ValidationPipe) updateDto: UpdateLeaveRequestDto
  ) {
    return this.leavesService.updateLeaveRequest(id, userId, updateDto);
  }

  @Put('requests/:id/approve')
  @Roles('supervisor', 'hr', 'admin')
  async approveLeaveRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') approverId: number,
    @Body(ValidationPipe) approveDto: ApproveLeaveRequestDto
  ) {
    return this.leavesService.approveLeaveRequest(id, approverId, approveDto);
  }

  @Put('requests/:id/cancel')
  async cancelLeaveRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number
  ) {
    return this.leavesService.cancelLeaveRequest(id, userId);
  }

  @Delete('requests/:id')
  @Roles('admin')
  async deleteLeaveRequest(@Param('id', ParseIntPipe) id: number) {
    // This would be implemented if needed for admin purposes
    return { message: 'Delete functionality not implemented' };
  }

  // Statistics endpoints
  @Get('statistics/my')
  async getMyLeaveStatistics(@CurrentUser('id') userId: number) {
    const filters: LeaveRequestFilterDto = {};
    const requests = await this.leavesService.getLeaveRequests(filters, userId);
    const balance = await this.leavesService.getLeaveBalance(userId);

    return {
      total_requests: requests.length,
      pending_requests: requests.filter(r => r.status === 'pending').length,
      approved_requests: requests.filter(r => r.status === 'approved').length,
      rejected_requests: requests.filter(r => r.status === 'rejected').length,
      leave_balance: balance,
    };
  }

  @Get('statistics/department/:departmentId')
  @Roles('supervisor', 'hr', 'admin')
  async getDepartmentLeaveStatistics(
    @Param('departmentId', ParseIntPipe) departmentId: number
  ) {
    // This would need additional implementation to filter by department
    return { message: 'Department statistics not implemented yet' };
  }
}