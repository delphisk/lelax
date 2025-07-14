import { LeavesService } from './leaves.service';
import { CreateLeaveRequestDto, UpdateLeaveRequestDto, ApproveLeaveRequestDto, LeaveRequestFilterDto, UpdateLeaveBalanceDto } from '../common/dto/leave.dto';
export declare class LeavesController {
    private leavesService;
    constructor(leavesService: LeavesService);
    getLeaveTypes(): Promise<import("../common/entities/leave.entity").LeaveType[]>;
    getFiscalYears(): Promise<import("../common/entities/leave.entity").FiscalYear[]>;
    getCurrentFiscalYear(): Promise<import("../common/entities/leave.entity").FiscalYear>;
    getMyLeaveBalance(userId: number, fiscalYearId?: number): Promise<import("../common/entities/leave.entity").LeaveBalance[]>;
    getUserLeaveBalance(userId: number, fiscalYearId?: number): Promise<import("../common/entities/leave.entity").LeaveBalance[]>;
    updateLeaveBalance(updateDto: UpdateLeaveBalanceDto): Promise<import("../common/entities/leave.entity").LeaveBalance>;
    getLeaveRequests(userId: number, userRole: string, filters: LeaveRequestFilterDto): Promise<import("../common/entities/leave.entity").LeaveRequest[]>;
    getMyLeaveRequests(userId: number, filters: LeaveRequestFilterDto): Promise<import("../common/entities/leave.entity").LeaveRequest[]>;
    getPendingApprovals(userId: number): Promise<import("../common/entities/leave.entity").LeaveRequest[]>;
    getLeaveRequest(id: number): Promise<import("../common/entities/leave.entity").LeaveRequest>;
    createLeaveRequest(userId: number, createDto: CreateLeaveRequestDto): Promise<import("../common/entities/leave.entity").LeaveRequest>;
    updateLeaveRequest(id: number, userId: number, updateDto: UpdateLeaveRequestDto): Promise<import("../common/entities/leave.entity").LeaveRequest>;
    approveLeaveRequest(id: number, approverId: number, approveDto: ApproveLeaveRequestDto): Promise<import("../common/entities/leave.entity").LeaveRequest>;
    cancelLeaveRequest(id: number, userId: number): Promise<import("../common/entities/leave.entity").LeaveRequest>;
    deleteLeaveRequest(id: number): Promise<{
        message: string;
    }>;
    getMyLeaveStatistics(userId: number): Promise<{
        total_requests: number;
        pending_requests: number;
        approved_requests: number;
        rejected_requests: number;
        leave_balance: import("../common/entities/leave.entity").LeaveBalance[];
    }>;
    getDepartmentLeaveStatistics(departmentId: number): Promise<{
        message: string;
    }>;
}
