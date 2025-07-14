import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users/users.service';
import { LeaveRequest, LeaveBalance, LeaveType, FiscalYear } from '../common/entities/leave.entity';
import { CreateLeaveRequestDto, UpdateLeaveRequestDto, ApproveLeaveRequestDto, LeaveRequestFilterDto, UpdateLeaveBalanceDto } from '../common/dto/leave.dto';
export declare class LeavesService {
    private databaseService;
    private usersService;
    constructor(databaseService: DatabaseService, usersService: UsersService);
    getLeaveTypes(): Promise<LeaveType[]>;
    getFiscalYears(): Promise<FiscalYear[]>;
    getCurrentFiscalYear(): Promise<FiscalYear>;
    getLeaveBalance(userId: number, fiscalYearId?: number): Promise<LeaveBalance[]>;
    updateLeaveBalance(updateDto: UpdateLeaveBalanceDto): Promise<LeaveBalance>;
    getLeaveRequests(filters: LeaveRequestFilterDto, userId?: number): Promise<LeaveRequest[]>;
    getLeaveRequestById(id: number): Promise<LeaveRequest>;
    createLeaveRequest(userId: number, createDto: CreateLeaveRequestDto): Promise<LeaveRequest>;
    updateLeaveRequest(id: number, userId: number, updateDto: UpdateLeaveRequestDto): Promise<LeaveRequest>;
    approveLeaveRequest(id: number, approverId: number, approveDto: ApproveLeaveRequestDto): Promise<LeaveRequest>;
    cancelLeaveRequest(id: number, userId: number): Promise<LeaveRequest>;
    getPendingApprovals(supervisorId: number): Promise<LeaveRequest[]>;
}
