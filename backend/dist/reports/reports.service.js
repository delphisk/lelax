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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const users_service_1 = require("../users/users.service");
const leaves_service_1 = require("../leaves/leaves.service");
let ReportsService = class ReportsService {
    constructor(databaseService, usersService, leavesService) {
        this.databaseService = databaseService;
        this.usersService = usersService;
        this.leavesService = leavesService;
    }
    async getPersonalStatistics(userId, fiscalYear) {
        const knex = this.databaseService.getKnex();
        let fiscalYearId;
        if (fiscalYear) {
            const fy = await knex('fiscal_years').where('year', fiscalYear).first();
            fiscalYearId = fy?.id;
        }
        else {
            const currentFY = await this.leavesService.getCurrentFiscalYear();
            fiscalYearId = currentFY.id;
        }
        const leaveBalance = await this.leavesService.getLeaveBalance(userId, fiscalYearId);
        const leaveRequests = await knex('leave_requests')
            .select('leave_requests.*', 'leave_types.name as leave_type_name', 'leave_types.code as leave_type_code')
            .leftJoin('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
            .leftJoin('fiscal_years', function () {
            this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
        })
            .where('leave_requests.user_id', userId)
            .where('fiscal_years.id', fiscalYearId)
            .orderBy('leave_requests.created_at', 'desc');
        const totalRequests = leaveRequests.length;
        const approvedRequests = leaveRequests.filter(r => r.status === 'approved').length;
        const pendingRequests = leaveRequests.filter(r => r.status === 'pending').length;
        const rejectedRequests = leaveRequests.filter(r => r.status === 'rejected').length;
        const cancelledRequests = leaveRequests.filter(r => r.status === 'cancelled').length;
        const daysByLeaveType = leaveRequests
            .filter(r => r.status === 'approved')
            .reduce((acc, request) => {
            const key = request.leave_type_code;
            acc[key] = (acc[key] || 0) + request.total_days;
            return acc;
        }, {});
        return {
            fiscal_year: fiscalYear || (await this.leavesService.getCurrentFiscalYear()).year,
            leave_balance: leaveBalance,
            statistics: {
                total_requests: totalRequests,
                approved_requests: approvedRequests,
                pending_requests: pendingRequests,
                rejected_requests: rejectedRequests,
                cancelled_requests: cancelledRequests,
                days_by_leave_type: daysByLeaveType,
            },
            recent_requests: leaveRequests.slice(0, 10),
        };
    }
    async getOrganizationSummary(fiscalYear) {
        const knex = this.databaseService.getKnex();
        let fiscalYearId;
        if (fiscalYear) {
            const fy = await knex('fiscal_years').where('year', fiscalYear).first();
            fiscalYearId = fy?.id;
        }
        else {
            const currentFY = await this.leavesService.getCurrentFiscalYear();
            fiscalYearId = currentFY.id;
        }
        const totalEmployees = await knex('users')
            .where('is_active', true)
            .count('id as count')
            .first();
        const leaveStats = await knex('leave_requests')
            .select(knex.raw('COUNT(*) as total_requests'), knex.raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved_requests'), knex.raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_requests'), knex.raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_requests'), knex.raw('SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled_requests'), knex.raw('SUM(CASE WHEN status = "approved" THEN total_days ELSE 0 END) as total_days_taken'))
            .leftJoin('fiscal_years', function () {
            this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
        })
            .where('fiscal_years.id', fiscalYearId)
            .first();
        const departmentStats = await knex('leave_requests')
            .select('departments.name as department_name', knex.raw('COUNT(*) as total_requests'), knex.raw('SUM(CASE WHEN leave_requests.status = "approved" THEN 1 ELSE 0 END) as approved_requests'), knex.raw('SUM(CASE WHEN leave_requests.status = "approved" THEN leave_requests.total_days ELSE 0 END) as total_days_taken'))
            .leftJoin('users', 'leave_requests.user_id', 'users.id')
            .leftJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('fiscal_years', function () {
            this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
        })
            .where('fiscal_years.id', fiscalYearId)
            .groupBy('departments.id', 'departments.name')
            .orderBy('total_requests', 'desc');
        const leaveTypeStats = await knex('leave_requests')
            .select('leave_types.name as leave_type_name', 'leave_types.code as leave_type_code', knex.raw('COUNT(*) as total_requests'), knex.raw('SUM(CASE WHEN leave_requests.status = "approved" THEN 1 ELSE 0 END) as approved_requests'), knex.raw('SUM(CASE WHEN leave_requests.status = "approved" THEN leave_requests.total_days ELSE 0 END) as total_days_taken'))
            .leftJoin('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
            .leftJoin('fiscal_years', function () {
            this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
        })
            .where('fiscal_years.id', fiscalYearId)
            .groupBy('leave_types.id', 'leave_types.name', 'leave_types.code')
            .orderBy('total_requests', 'desc');
        return {
            fiscal_year: fiscalYear || (await this.leavesService.getCurrentFiscalYear()).year,
            organization_stats: {
                total_employees: totalEmployees.count,
                ...leaveStats,
            },
            department_breakdown: departmentStats,
            leave_type_breakdown: leaveTypeStats,
        };
    }
    async getDepartmentReport(departmentId, fiscalYear) {
        const knex = this.databaseService.getKnex();
        let fiscalYearId;
        if (fiscalYear) {
            const fy = await knex('fiscal_years').where('year', fiscalYear).first();
            fiscalYearId = fy?.id;
        }
        else {
            const currentFY = await this.leavesService.getCurrentFiscalYear();
            fiscalYearId = currentFY.id;
        }
        const department = await knex('departments')
            .select('*')
            .where('id', departmentId)
            .first();
        const employees = await knex('users')
            .select('id', 'employee_id', 'first_name', 'last_name', 'email', 'role')
            .where('department_id', departmentId)
            .where('is_active', true);
        const employeeStats = await Promise.all(employees.map(async (employee) => {
            const stats = await this.getPersonalStatistics(employee.id, fiscalYear);
            return {
                employee,
                ...stats,
            };
        }));
        const departmentSummary = await knex('leave_requests')
            .select(knex.raw('COUNT(*) as total_requests'), knex.raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved_requests'), knex.raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_requests'), knex.raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_requests'), knex.raw('SUM(CASE WHEN status = "approved" THEN total_days ELSE 0 END) as total_days_taken'))
            .leftJoin('users', 'leave_requests.user_id', 'users.id')
            .leftJoin('fiscal_years', function () {
            this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
        })
            .where('users.department_id', departmentId)
            .where('fiscal_years.id', fiscalYearId)
            .first();
        return {
            fiscal_year: fiscalYear || (await this.leavesService.getCurrentFiscalYear()).year,
            department,
            department_summary: departmentSummary,
            employee_statistics: employeeStats,
        };
    }
    async getUserReport(userId, fiscalYear) {
        const user = await this.usersService.findById(userId);
        const statistics = await this.getPersonalStatistics(userId, fiscalYear);
        return {
            user: {
                id: user.id,
                employee_id: user.employee_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                department_id: user.department_id,
                position_id: user.position_id,
                department_name: user.department_name,
                position_name: user.position_name,
            },
            ...statistics,
        };
    }
    async getLeaveUsageReport(fiscalYear) {
        const knex = this.databaseService.getKnex();
        let fiscalYearId;
        if (fiscalYear) {
            const fy = await knex('fiscal_years').where('year', fiscalYear).first();
            fiscalYearId = fy?.id;
        }
        else {
            const currentFY = await this.leavesService.getCurrentFiscalYear();
            fiscalYearId = currentFY.id;
        }
        const monthlyUsage = await knex('leave_requests')
            .select(knex.raw('MONTH(start_date) as month'), knex.raw('YEAR(start_date) as year'), knex.raw('COUNT(*) as total_requests'), knex.raw('SUM(CASE WHEN status = "approved" THEN total_days ELSE 0 END) as total_days'))
            .leftJoin('fiscal_years', function () {
            this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
        })
            .where('fiscal_years.id', fiscalYearId)
            .groupBy(knex.raw('YEAR(start_date), MONTH(start_date)'))
            .orderBy('year')
            .orderBy('month');
        const peakPeriods = await knex('leave_requests')
            .select('start_date', knex.raw('COUNT(*) as concurrent_leaves'))
            .where('status', 'approved')
            .leftJoin('fiscal_years', function () {
            this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
        })
            .where('fiscal_years.id', fiscalYearId)
            .groupBy('start_date')
            .having('concurrent_leaves', '>', 1)
            .orderBy('concurrent_leaves', 'desc')
            .limit(10);
        return {
            fiscal_year: fiscalYear || (await this.leavesService.getCurrentFiscalYear()).year,
            monthly_usage: monthlyUsage,
            peak_periods: peakPeriods,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        users_service_1.UsersService,
        leaves_service_1.LeavesService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map