import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users/users.service';
import { LeavesService } from '../leaves/leaves.service';
export declare class ReportsService {
    private databaseService;
    private usersService;
    private leavesService;
    constructor(databaseService: DatabaseService, usersService: UsersService, leavesService: LeavesService);
    getPersonalStatistics(userId: number, fiscalYear?: number): Promise<{
        fiscal_year: number;
        leave_balance: import("../common/entities/leave.entity").LeaveBalance[];
        statistics: {
            total_requests: number;
            approved_requests: number;
            pending_requests: number;
            rejected_requests: number;
            cancelled_requests: number;
            days_by_leave_type: any;
        };
        recent_requests: any[];
    }>;
    getOrganizationSummary(fiscalYear?: number): Promise<{
        fiscal_year: number;
        organization_stats: {
            timeout: any;
            wrap: any;
            toSQL: any;
            queryContext: any;
            [EventEmitter.captureRejectionSymbol]?: any;
            addListener: any;
            on: any;
            once: any;
            removeListener: any;
            off: any;
            removeAllListeners: any;
            setMaxListeners: any;
            getMaxListeners: any;
            listeners: any;
            rawListeners: any;
            emit: any;
            listenerCount: any;
            prependListener: any;
            prependOnceListener: any;
            eventNames: any;
            generateDdlCommands: any;
            toQuery: any;
            options: any;
            connection: any;
            debug: any;
            transacting: any;
            stream: any;
            pipe: any;
            asCallback: any;
            then: any;
            catch: any;
            finally: any;
            [Symbol.toStringTag]: any;
            total_employees: string | number;
        };
        department_breakdown: any[];
        leave_type_breakdown: any[];
    }>;
    getDepartmentReport(departmentId: number, fiscalYear?: number): Promise<{
        fiscal_year: number;
        department: any;
        department_summary: {
            timeout: any;
            wrap: any;
            toSQL: any;
            queryContext: any;
            [EventEmitter.captureRejectionSymbol]?: any;
            addListener: any;
            on: any;
            once: any;
            removeListener: any;
            off: any;
            removeAllListeners: any;
            setMaxListeners: any;
            getMaxListeners: any;
            listeners: any;
            rawListeners: any;
            emit: any;
            listenerCount: any;
            prependListener: any;
            prependOnceListener: any;
            eventNames: any;
            generateDdlCommands: any;
            toQuery: any;
            options: any;
            connection: any;
            debug: any;
            transacting: any;
            stream: any;
            pipe: any;
            asCallback: any;
            then: any;
            catch: any;
            finally: any;
            readonly [Symbol.toStringTag]: any;
        };
        employee_statistics: {
            fiscal_year: number;
            leave_balance: import("../common/entities/leave.entity").LeaveBalance[];
            statistics: {
                total_requests: number;
                approved_requests: number;
                pending_requests: number;
                rejected_requests: number;
                cancelled_requests: number;
                days_by_leave_type: any;
            };
            recent_requests: any[];
            employee: any;
        }[];
    }>;
    getUserReport(userId: number, fiscalYear?: number): Promise<{
        fiscal_year: number;
        leave_balance: import("../common/entities/leave.entity").LeaveBalance[];
        statistics: {
            total_requests: number;
            approved_requests: number;
            pending_requests: number;
            rejected_requests: number;
            cancelled_requests: number;
            days_by_leave_type: any;
        };
        recent_requests: any[];
        user: {
            id: number;
            employee_id: string;
            first_name: string;
            last_name: string;
            email: string;
            department_id: number;
            position_id: number;
            department_name: any;
            position_name: any;
        };
    }>;
    getLeaveUsageReport(fiscalYear?: number): Promise<{
        fiscal_year: number;
        monthly_usage: any;
        peak_periods: any[];
    }>;
}
