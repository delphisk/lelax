import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users/users.service';
import { LeavesService } from '../leaves/leaves.service';

@Injectable()
export class ReportsService {
  constructor(
    private databaseService: DatabaseService,
    private usersService: UsersService,
    private leavesService: LeavesService,
  ) {}

  async getPersonalStatistics(userId: number, fiscalYear?: number) {
    const knex = this.databaseService.getKnex();
    
    let fiscalYearId: number;
    if (fiscalYear) {
      const fy = await knex('fiscal_years').where('year', fiscalYear).first();
      fiscalYearId = fy?.id;
    } else {
      const currentFY = await this.leavesService.getCurrentFiscalYear();
      fiscalYearId = currentFY.id;
    }

    // Get leave balance
    const leaveBalance = await this.leavesService.getLeaveBalance(userId, fiscalYearId);

    // Get leave requests for the fiscal year
    const leaveRequests = await knex('leave_requests')
      .select(
        'leave_requests.*',
        'leave_types.name as leave_type_name',
        'leave_types.code as leave_type_code'
      )
      .leftJoin('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
      .leftJoin('fiscal_years', function() {
        this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
      })
      .where('leave_requests.user_id', userId)
      .where('fiscal_years.id', fiscalYearId)
      .orderBy('leave_requests.created_at', 'desc');

    // Calculate statistics
    const totalRequests = leaveRequests.length;
    const approvedRequests = leaveRequests.filter(r => r.status === 'approved').length;
    const pendingRequests = leaveRequests.filter(r => r.status === 'pending').length;
    const rejectedRequests = leaveRequests.filter(r => r.status === 'rejected').length;
    const cancelledRequests = leaveRequests.filter(r => r.status === 'cancelled').length;

    // Calculate days by leave type
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

  async getOrganizationSummary(fiscalYear?: number) {
    const knex = this.databaseService.getKnex();

    let fiscalYearId: number;
    if (fiscalYear) {
      const fy = await knex('fiscal_years').where('year', fiscalYear).first();
      fiscalYearId = fy?.id;
    } else {
      const currentFY = await this.leavesService.getCurrentFiscalYear();
      fiscalYearId = currentFY.id;
    }

    // Total employees
    const totalEmployees = await knex('users')
      .where('is_active', true)
      .count('id as count')
      .first();

    // Leave requests statistics
    const leaveStats = await knex('leave_requests')
      .select(
        knex.raw('COUNT(*) as total_requests'),
        knex.raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved_requests'),
        knex.raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_requests'),
        knex.raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_requests'),
        knex.raw('SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled_requests'),
        knex.raw('SUM(CASE WHEN status = "approved" THEN total_days ELSE 0 END) as total_days_taken')
      )
      .leftJoin('fiscal_years', function() {
        this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
      })
      .where('fiscal_years.id', fiscalYearId)
      .first();

    // Leave requests by department
    const departmentStats = await knex('leave_requests')
      .select(
        'departments.name as department_name',
        knex.raw('COUNT(*) as total_requests'),
        knex.raw('SUM(CASE WHEN leave_requests.status = "approved" THEN 1 ELSE 0 END) as approved_requests'),
        knex.raw('SUM(CASE WHEN leave_requests.status = "approved" THEN leave_requests.total_days ELSE 0 END) as total_days_taken')
      )
      .leftJoin('users', 'leave_requests.user_id', 'users.id')
      .leftJoin('departments', 'users.department_id', 'departments.id')
      .leftJoin('fiscal_years', function() {
        this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
      })
      .where('fiscal_years.id', fiscalYearId)
      .groupBy('departments.id', 'departments.name')
      .orderBy('total_requests', 'desc');

    // Leave requests by type
    const leaveTypeStats = await knex('leave_requests')
      .select(
        'leave_types.name as leave_type_name',
        'leave_types.code as leave_type_code',
        knex.raw('COUNT(*) as total_requests'),
        knex.raw('SUM(CASE WHEN leave_requests.status = "approved" THEN 1 ELSE 0 END) as approved_requests'),
        knex.raw('SUM(CASE WHEN leave_requests.status = "approved" THEN leave_requests.total_days ELSE 0 END) as total_days_taken')
      )
      .leftJoin('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
      .leftJoin('fiscal_years', function() {
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

  async getDepartmentReport(departmentId: number, fiscalYear?: number) {
    const knex = this.databaseService.getKnex();

    let fiscalYearId: number;
    if (fiscalYear) {
      const fy = await knex('fiscal_years').where('year', fiscalYear).first();
      fiscalYearId = fy?.id;
    } else {
      const currentFY = await this.leavesService.getCurrentFiscalYear();
      fiscalYearId = currentFY.id;
    }

    // Department info
    const department = await knex('departments')
      .select('*')
      .where('id', departmentId)
      .first();

    // Department employees
    const employees = await knex('users')
      .select('id', 'employee_id', 'first_name', 'last_name', 'email', 'role')
      .where('department_id', departmentId)
      .where('is_active', true);

    // Leave statistics for department employees
    const employeeStats = await Promise.all(
      employees.map(async (employee) => {
        const stats = await this.getPersonalStatistics(employee.id, fiscalYear);
        return {
          employee,
          ...stats,
        };
      })
    );

    // Department summary
    const departmentSummary = await knex('leave_requests')
      .select(
        knex.raw('COUNT(*) as total_requests'),
        knex.raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved_requests'),
        knex.raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_requests'),
        knex.raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_requests'),
        knex.raw('SUM(CASE WHEN status = "approved" THEN total_days ELSE 0 END) as total_days_taken')
      )
      .leftJoin('users', 'leave_requests.user_id', 'users.id')
      .leftJoin('fiscal_years', function() {
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

  async getUserReport(userId: number, fiscalYear?: number) {
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
        // Note: department_name and position_name would be available if UsersService.findById joins with departments and positions
        department_name: (user as any).department_name,
        position_name: (user as any).position_name,
      },
      ...statistics,
    };
  }

  async getLeaveUsageReport(fiscalYear?: number) {
    const knex = this.databaseService.getKnex();

    let fiscalYearId: number;
    if (fiscalYear) {
      const fy = await knex('fiscal_years').where('year', fiscalYear).first();
      fiscalYearId = fy?.id;
    } else {
      const currentFY = await this.leavesService.getCurrentFiscalYear();
      fiscalYearId = currentFY.id;
    }

    // Monthly leave usage
    const monthlyUsage = await knex('leave_requests')
      .select(
        knex.raw('MONTH(start_date) as month'),
        knex.raw('YEAR(start_date) as year'),
        knex.raw('COUNT(*) as total_requests'),
        knex.raw('SUM(CASE WHEN status = "approved" THEN total_days ELSE 0 END) as total_days')
      )
      .leftJoin('fiscal_years', function() {
        this.on(knex.raw('leave_requests.start_date BETWEEN fiscal_years.start_date AND fiscal_years.end_date'));
      })
      .where('fiscal_years.id', fiscalYearId)
      .groupBy(knex.raw('YEAR(start_date), MONTH(start_date)'))
      .orderBy('year')
      .orderBy('month');

    // Peak leave periods
    const peakPeriods = await knex('leave_requests')
      .select(
        'start_date',
        knex.raw('COUNT(*) as concurrent_leaves')
      )
      .where('status', 'approved')
      .leftJoin('fiscal_years', function() {
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
}