import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users/users.service';
import { LeaveRequest, LeaveBalance, LeaveType, FiscalYear } from '../common/entities/leave.entity';
import { 
  CreateLeaveRequestDto, 
  UpdateLeaveRequestDto, 
  ApproveLeaveRequestDto,
  LeaveRequestFilterDto,
  UpdateLeaveBalanceDto 
} from '../common/dto/leave.dto';
import moment from 'moment';

@Injectable()
export class LeavesService {
  constructor(
    private databaseService: DatabaseService,
    private usersService: UsersService,
  ) {}

  // Leave Types
  async getLeaveTypes(): Promise<LeaveType[]> {
    const knex = this.databaseService.getKnex();
    return knex('leave_types')
      .select('*')
      .where('is_active', true)
      .orderBy('name');
  }

  // Fiscal Years
  async getFiscalYears(): Promise<FiscalYear[]> {
    const knex = this.databaseService.getKnex();
    return knex('fiscal_years')
      .select('*')
      .orderBy('year', 'desc');
  }

  async getCurrentFiscalYear(): Promise<FiscalYear> {
    const knex = this.databaseService.getKnex();
    const fiscalYear = await knex('fiscal_years')
      .select('*')
      .where('is_active', true)
      .first();

    if (!fiscalYear) {
      throw new NotFoundException('No active fiscal year found');
    }

    return fiscalYear;
  }

  // Leave Balances
  async getLeaveBalance(userId: number, fiscalYearId?: number): Promise<LeaveBalance[]> {
    const knex = this.databaseService.getKnex();
    
    let query = knex('leave_balances')
      .select(
        'leave_balances.*',
        'leave_types.name as leave_type_name',
        'leave_types.code as leave_type_code',
        'fiscal_years.year as fiscal_year'
      )
      .leftJoin('leave_types', 'leave_balances.leave_type_id', 'leave_types.id')
      .leftJoin('fiscal_years', 'leave_balances.fiscal_year_id', 'fiscal_years.id')
      .where('leave_balances.user_id', userId);

    if (fiscalYearId) {
      query = query.where('leave_balances.fiscal_year_id', fiscalYearId);
    } else {
      // Get current fiscal year if not specified
      const currentFiscalYear = await this.getCurrentFiscalYear();
      query = query.where('leave_balances.fiscal_year_id', currentFiscalYear.id);
    }

    return query.orderBy('leave_types.name');
  }

  async updateLeaveBalance(updateDto: UpdateLeaveBalanceDto): Promise<LeaveBalance> {
    const knex = this.databaseService.getKnex();

    // Check if balance record exists
    const existingBalance = await knex('leave_balances')
      .where('user_id', updateDto.user_id)
      .where('leave_type_id', updateDto.leave_type_id)
      .where('fiscal_year_id', updateDto.fiscal_year_id)
      .first();

    let balance: LeaveBalance;

    if (existingBalance) {
      // Update existing balance
      const updateData: any = {
        ...updateDto,
        updated_at: new Date(),
      };

      // Calculate remaining balance
      if (updateDto.opening_balance !== undefined || updateDto.earned_days !== undefined) {
        const openingBalance = updateDto.opening_balance ?? existingBalance.opening_balance;
        const earnedDays = updateDto.earned_days ?? existingBalance.earned_days;
        const carriedOver = updateDto.carried_over ?? existingBalance.carried_over;
        
        updateData.remaining_balance = openingBalance + earnedDays + carriedOver - existingBalance.used_days;
      }

      await knex('leave_balances')
        .where('id', existingBalance.id)
        .update(updateData);

      balance = await knex('leave_balances').where('id', existingBalance.id).first();
    } else {
      // Create new balance record
      const balanceData = {
        ...updateDto,
        used_days: 0,
        remaining_balance: (updateDto.opening_balance || 0) + (updateDto.earned_days || 0) + (updateDto.carried_over || 0),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [balanceId] = await knex('leave_balances').insert(balanceData);
      balance = await knex('leave_balances').where('id', balanceId).first();
    }

    return balance;
  }

  // Leave Requests
  async getLeaveRequests(filters: LeaveRequestFilterDto, userId?: number): Promise<LeaveRequest[]> {
    const knex = this.databaseService.getKnex();
    
    let query = knex('leave_requests')
      .select(
        'leave_requests.*',
        'users.first_name',
        'users.last_name',
        'users.employee_id',
        'leave_types.name as leave_type_name',
        'leave_types.code as leave_type_code',
        'supervisors.first_name as supervisor_first_name',
        'supervisors.last_name as supervisor_last_name',
        'hr_users.first_name as hr_first_name',
        'hr_users.last_name as hr_last_name'
      )
      .leftJoin('users', 'leave_requests.user_id', 'users.id')
      .leftJoin('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
      .leftJoin('users as supervisors', 'leave_requests.supervisor_id', 'supervisors.id')
      .leftJoin('users as hr_users', 'leave_requests.hr_id', 'hr_users.id');

    // Apply filters
    if (userId) {
      query = query.where('leave_requests.user_id', userId);
    }

    if (filters.status) {
      query = query.where('leave_requests.status', filters.status);
    }

    if (filters.leave_type_id) {
      query = query.where('leave_requests.leave_type_id', filters.leave_type_id);
    }

    if (filters.user_id) {
      query = query.where('leave_requests.user_id', filters.user_id);
    }

    if (filters.start_date) {
      query = query.where('leave_requests.start_date', '>=', filters.start_date);
    }

    if (filters.end_date) {
      query = query.where('leave_requests.end_date', '<=', filters.end_date);
    }

    if (filters.fiscal_year) {
      const fiscalYear = await knex('fiscal_years')
        .where('year', filters.fiscal_year)
        .first();
      
      if (fiscalYear) {
        query = query
          .where('leave_requests.start_date', '>=', fiscalYear.start_date)
          .where('leave_requests.start_date', '<=', fiscalYear.end_date);
      }
    }

    return query.orderBy('leave_requests.created_at', 'desc');
  }

  async getLeaveRequestById(id: number): Promise<LeaveRequest> {
    const knex = this.databaseService.getKnex();
    
    const request = await knex('leave_requests')
      .select(
        'leave_requests.*',
        'users.first_name',
        'users.last_name',
        'users.employee_id',
        'leave_types.name as leave_type_name',
        'leave_types.code as leave_type_code'
      )
      .leftJoin('users', 'leave_requests.user_id', 'users.id')
      .leftJoin('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
      .where('leave_requests.id', id)
      .first();

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    return request;
  }

  async createLeaveRequest(userId: number, createDto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const knex = this.databaseService.getKnex();

    // Validate dates
    const startDate = moment(createDto.start_date);
    const endDate = moment(createDto.end_date);
    
    if (endDate.isBefore(startDate)) {
      throw new BadRequestException('End date cannot be before start date');
    }

    // Calculate total days
    const totalDays = endDate.diff(startDate, 'days') + 1;

    // Get leave type details
    const leaveType = await knex('leave_types')
      .where('id', createDto.leave_type_id)
      .where('is_active', true)
      .first();

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Check advance notice requirement
    const today = moment();
    const daysDifference = startDate.diff(today, 'days');
    
    if (daysDifference < leaveType.advance_notice_days) {
      throw new BadRequestException(
        `This leave type requires ${leaveType.advance_notice_days} days advance notice`
      );
    }

    // Check maximum consecutive days
    if (totalDays > leaveType.max_consecutive_days) {
      throw new BadRequestException(
        `Maximum consecutive days for this leave type is ${leaveType.max_consecutive_days}`
      );
    }

    // Check leave balance
    const currentFiscalYear = await this.getCurrentFiscalYear();
    const balance = await knex('leave_balances')
      .where('user_id', userId)
      .where('leave_type_id', createDto.leave_type_id)
      .where('fiscal_year_id', currentFiscalYear.id)
      .first();

    if (!balance || balance.remaining_balance < totalDays) {
      throw new BadRequestException('Insufficient leave balance');
    }

    // Get user's supervisor
    const user = await this.usersService.findById(userId);
    const supervisor = await knex('users')
      .where('department_id', user.department_id)
      .where('role', 'supervisor')
      .where('is_active', true)
      .first();

    const requestData = {
      user_id: userId,
      leave_type_id: createDto.leave_type_id,
      start_date: startDate.toDate(),
      end_date: endDate.toDate(),
      total_days: totalDays,
      reason: createDto.reason,
      status: 'pending',
      supervisor_id: supervisor?.id,
      medical_certificate: createDto.medical_certificate,
      attachments: createDto.attachments,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [requestId] = await knex('leave_requests').insert(requestData);
    return this.getLeaveRequestById(requestId);
  }

  async updateLeaveRequest(id: number, userId: number, updateDto: UpdateLeaveRequestDto): Promise<LeaveRequest> {
    const knex = this.databaseService.getKnex();

    const request = await this.getLeaveRequestById(id);
    
    // Check if user owns the request
    if (request.user_id !== userId) {
      throw new ForbiddenException('You can only update your own leave requests');
    }

    // Check if request can be updated
    if (request.status !== 'pending') {
      throw new BadRequestException('Only pending requests can be updated');
    }

    let updateData: any = {
      ...updateDto,
      updated_at: new Date(),
    };

    // Recalculate total days if dates are updated
    if (updateDto.start_date || updateDto.end_date) {
      const startDate = moment(updateDto.start_date || request.start_date);
      const endDate = moment(updateDto.end_date || request.end_date);
      
      if (endDate.isBefore(startDate)) {
        throw new BadRequestException('End date cannot be before start date');
      }

      updateData.total_days = endDate.diff(startDate, 'days') + 1;
      updateData.start_date = startDate.toDate();
      updateData.end_date = endDate.toDate();
    }

    await knex('leave_requests')
      .where('id', id)
      .update(updateData);

    return this.getLeaveRequestById(id);
  }

  async approveLeaveRequest(id: number, approverId: number, approveDto: ApproveLeaveRequestDto): Promise<LeaveRequest> {
    const knex = this.databaseService.getKnex();

    const request = await this.getLeaveRequestById(id);
    
    if (request.status !== 'pending') {
      throw new BadRequestException('Only pending requests can be approved/rejected');
    }

    const approver = await this.usersService.findById(approverId);
    
    // Check if approver has permission
    if (!['supervisor', 'hr', 'admin'].includes(approver.role)) {
      throw new ForbiddenException('You do not have permission to approve leave requests');
    }

    const updateData: any = {
      status: approveDto.status,
      updated_at: new Date(),
    };

    // Set appropriate comment and approver based on role
    if (approver.role === 'supervisor') {
      updateData.supervisor_id = approverId;
      updateData.supervisor_comment = approveDto.comment;
    } else {
      updateData.hr_id = approverId;
      updateData.hr_comment = approveDto.comment;
    }

    if (approveDto.status === 'approved') {
      updateData.approved_at = new Date();
      
      // Update leave balance
      const currentFiscalYear = await this.getCurrentFiscalYear();
      await knex('leave_balances')
        .where('user_id', request.user_id)
        .where('leave_type_id', request.leave_type_id)
        .where('fiscal_year_id', currentFiscalYear.id)
        .increment('used_days', request.total_days)
        .decrement('remaining_balance', request.total_days);
    }

    await knex('leave_requests')
      .where('id', id)
      .update(updateData);

    return this.getLeaveRequestById(id);
  }

  async cancelLeaveRequest(id: number, userId: number): Promise<LeaveRequest> {
    const knex = this.databaseService.getKnex();

    const request = await this.getLeaveRequestById(id);
    
    // Check if user owns the request
    if (request.user_id !== userId) {
      throw new ForbiddenException('You can only cancel your own leave requests');
    }

    // Check if request can be cancelled
    if (!['pending', 'approved'].includes(request.status)) {
      throw new BadRequestException('Only pending or approved requests can be cancelled');
    }

    // If request was approved, restore leave balance
    if (request.status === 'approved') {
      const currentFiscalYear = await this.getCurrentFiscalYear();
      await knex('leave_balances')
        .where('user_id', request.user_id)
        .where('leave_type_id', request.leave_type_id)
        .where('fiscal_year_id', currentFiscalYear.id)
        .decrement('used_days', request.total_days)
        .increment('remaining_balance', request.total_days);
    }

    await knex('leave_requests')
      .where('id', id)
      .update({
        status: 'cancelled',
        updated_at: new Date(),
      });

    return this.getLeaveRequestById(id);
  }

  async getPendingApprovals(supervisorId: number): Promise<LeaveRequest[]> {
    const knex = this.databaseService.getKnex();
    
    const supervisor = await this.usersService.findById(supervisorId);
    
    let query = knex('leave_requests')
      .select(
        'leave_requests.*',
        'users.first_name',
        'users.last_name',
        'users.employee_id',
        'leave_types.name as leave_type_name',
        'leave_types.code as leave_type_code'
      )
      .leftJoin('users', 'leave_requests.user_id', 'users.id')
      .leftJoin('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
      .where('leave_requests.status', 'pending');

    // Filter based on role
    if (supervisor.role === 'supervisor') {
      query = query
        .leftJoin('users as requesters', 'leave_requests.user_id', 'requesters.id')
        .where('requesters.department_id', supervisor.department_id);
    } else if (!['hr', 'admin'].includes(supervisor.role)) {
      throw new ForbiddenException('You do not have permission to view pending approvals');
    }

    return query.orderBy('leave_requests.created_at', 'asc');
  }
}