"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeavesService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const users_service_1 = require("../users/users.service");
const moment_1 = __importDefault(require("moment"));
let LeavesService = class LeavesService {
    constructor(databaseService, usersService) {
        this.databaseService = databaseService;
        this.usersService = usersService;
    }
    async getLeaveTypes() {
        const knex = this.databaseService.getKnex();
        return knex('leave_types')
            .select('*')
            .where('is_active', true)
            .orderBy('name');
    }
    async getFiscalYears() {
        const knex = this.databaseService.getKnex();
        return knex('fiscal_years')
            .select('*')
            .orderBy('year', 'desc');
    }
    async getCurrentFiscalYear() {
        const knex = this.databaseService.getKnex();
        const fiscalYear = await knex('fiscal_years')
            .select('*')
            .where('is_active', true)
            .first();
        if (!fiscalYear) {
            throw new common_1.NotFoundException('No active fiscal year found');
        }
        return fiscalYear;
    }
    async getLeaveBalance(userId, fiscalYearId) {
        const knex = this.databaseService.getKnex();
        let query = knex('leave_balances')
            .select('leave_balances.*', 'leave_types.name as leave_type_name', 'leave_types.code as leave_type_code', 'fiscal_years.year as fiscal_year')
            .leftJoin('leave_types', 'leave_balances.leave_type_id', 'leave_types.id')
            .leftJoin('fiscal_years', 'leave_balances.fiscal_year_id', 'fiscal_years.id')
            .where('leave_balances.user_id', userId);
        if (fiscalYearId) {
            query = query.where('leave_balances.fiscal_year_id', fiscalYearId);
        }
        else {
            const currentFiscalYear = await this.getCurrentFiscalYear();
            query = query.where('leave_balances.fiscal_year_id', currentFiscalYear.id);
        }
        return query.orderBy('leave_types.name');
    }
    async updateLeaveBalance(updateDto) {
        const knex = this.databaseService.getKnex();
        const existingBalance = await knex('leave_balances')
            .where('user_id', updateDto.user_id)
            .where('leave_type_id', updateDto.leave_type_id)
            .where('fiscal_year_id', updateDto.fiscal_year_id)
            .first();
        let balance;
        if (existingBalance) {
            const updateData = {
                ...updateDto,
                updated_at: new Date(),
            };
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
        }
        else {
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
    async getLeaveRequests(filters, userId) {
        const knex = this.databaseService.getKnex();
        let query = knex('leave_requests')
            .select('leave_requests.*', 'users.first_name', 'users.last_name', 'users.employee_id', 'leave_types.name as leave_type_name', 'leave_types.code as leave_type_code', 'supervisors.first_name as supervisor_first_name', 'supervisors.last_name as supervisor_last_name', 'hr_users.first_name as hr_first_name', 'hr_users.last_name as hr_last_name')
            .leftJoin('users', 'leave_requests.user_id', 'users.id')
            .leftJoin('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
            .leftJoin('users as supervisors', 'leave_requests.supervisor_id', 'supervisors.id')
            .leftJoin('users as hr_users', 'leave_requests.hr_id', 'hr_users.id');
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
    async getLeaveRequestById(id) {
        const knex = this.databaseService.getKnex();
        const request = await knex('leave_requests')
            .select('leave_requests.*', 'users.first_name', 'users.last_name', 'users.employee_id', 'leave_types.name as leave_type_name', 'leave_types.code as leave_type_code')
            .leftJoin('users', 'leave_requests.user_id', 'users.id')
            .leftJoin('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
            .where('leave_requests.id', id)
            .first();
        if (!request) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        return request;
    }
    async createLeaveRequest(userId, createDto) {
        const knex = this.databaseService.getKnex();
        const startDate = (0, moment_1.default)(createDto.start_date);
        const endDate = (0, moment_1.default)(createDto.end_date);
        if (endDate.isBefore(startDate)) {
            throw new common_1.BadRequestException('End date cannot be before start date');
        }
        const totalDays = endDate.diff(startDate, 'days') + 1;
        const leaveType = await knex('leave_types')
            .where('id', createDto.leave_type_id)
            .where('is_active', true)
            .first();
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        const today = (0, moment_1.default)();
        const daysDifference = startDate.diff(today, 'days');
        if (daysDifference < leaveType.advance_notice_days) {
            throw new common_1.BadRequestException(`This leave type requires ${leaveType.advance_notice_days} days advance notice`);
        }
        if (totalDays > leaveType.max_consecutive_days) {
            throw new common_1.BadRequestException(`Maximum consecutive days for this leave type is ${leaveType.max_consecutive_days}`);
        }
        const currentFiscalYear = await this.getCurrentFiscalYear();
        const balance = await knex('leave_balances')
            .where('user_id', userId)
            .where('leave_type_id', createDto.leave_type_id)
            .where('fiscal_year_id', currentFiscalYear.id)
            .first();
        if (!balance || balance.remaining_balance < totalDays) {
            throw new common_1.BadRequestException('Insufficient leave balance');
        }
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
    async updateLeaveRequest(id, userId, updateDto) {
        const knex = this.databaseService.getKnex();
        const request = await this.getLeaveRequestById(id);
        if (request.user_id !== userId) {
            throw new common_1.ForbiddenException('You can only update your own leave requests');
        }
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending requests can be updated');
        }
        let updateData = {
            ...updateDto,
            updated_at: new Date(),
        };
        if (updateDto.start_date || updateDto.end_date) {
            const startDate = (0, moment_1.default)(updateDto.start_date || request.start_date);
            const endDate = (0, moment_1.default)(updateDto.end_date || request.end_date);
            if (endDate.isBefore(startDate)) {
                throw new common_1.BadRequestException('End date cannot be before start date');
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
    async approveLeaveRequest(id, approverId, approveDto) {
        const knex = this.databaseService.getKnex();
        const request = await this.getLeaveRequestById(id);
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending requests can be approved/rejected');
        }
        const approver = await this.usersService.findById(approverId);
        if (!['supervisor', 'hr', 'admin'].includes(approver.role)) {
            throw new common_1.ForbiddenException('You do not have permission to approve leave requests');
        }
        const updateData = {
            status: approveDto.status,
            updated_at: new Date(),
        };
        if (approver.role === 'supervisor') {
            updateData.supervisor_id = approverId;
            updateData.supervisor_comment = approveDto.comment;
        }
        else {
            updateData.hr_id = approverId;
            updateData.hr_comment = approveDto.comment;
        }
        if (approveDto.status === 'approved') {
            updateData.approved_at = new Date();
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
    async cancelLeaveRequest(id, userId) {
        const knex = this.databaseService.getKnex();
        const request = await this.getLeaveRequestById(id);
        if (request.user_id !== userId) {
            throw new common_1.ForbiddenException('You can only cancel your own leave requests');
        }
        if (!['pending', 'approved'].includes(request.status)) {
            throw new common_1.BadRequestException('Only pending or approved requests can be cancelled');
        }
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
    async getPendingApprovals(supervisorId) {
        const knex = this.databaseService.getKnex();
        const supervisor = await this.usersService.findById(supervisorId);
        let query = knex('leave_requests')
            .select('leave_requests.*', 'users.first_name', 'users.last_name', 'users.employee_id', 'leave_types.name as leave_type_name', 'leave_types.code as leave_type_code')
            .leftJoin('users', 'leave_requests.user_id', 'users.id')
            .leftJoin('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
            .where('leave_requests.status', 'pending');
        if (supervisor.role === 'supervisor') {
            query = query
                .leftJoin('users as requesters', 'leave_requests.user_id', 'requesters.id')
                .where('requesters.department_id', supervisor.department_id);
        }
        else if (!['hr', 'admin'].includes(supervisor.role)) {
            throw new common_1.ForbiddenException('You do not have permission to view pending approvals');
        }
        return query.orderBy('leave_requests.created_at', 'asc');
    }
};
exports.LeavesService = LeavesService;
exports.LeavesService = LeavesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        users_service_1.UsersService])
], LeavesService);
//# sourceMappingURL=leaves.service.js.map