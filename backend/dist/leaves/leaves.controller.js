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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeavesController = void 0;
const common_1 = require("@nestjs/common");
const leaves_service_1 = require("./leaves.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const leave_dto_1 = require("../common/dto/leave.dto");
let LeavesController = class LeavesController {
    constructor(leavesService) {
        this.leavesService = leavesService;
    }
    async getLeaveTypes() {
        return this.leavesService.getLeaveTypes();
    }
    async getFiscalYears() {
        return this.leavesService.getFiscalYears();
    }
    async getCurrentFiscalYear() {
        return this.leavesService.getCurrentFiscalYear();
    }
    async getMyLeaveBalance(userId, fiscalYearId) {
        return this.leavesService.getLeaveBalance(userId, fiscalYearId);
    }
    async getUserLeaveBalance(userId, fiscalYearId) {
        return this.leavesService.getLeaveBalance(userId, fiscalYearId);
    }
    async updateLeaveBalance(updateDto) {
        return this.leavesService.updateLeaveBalance(updateDto);
    }
    async getLeaveRequests(userId, userRole, filters) {
        const requestUserId = ['supervisor', 'hr', 'admin'].includes(userRole) ? undefined : userId;
        return this.leavesService.getLeaveRequests(filters, requestUserId);
    }
    async getMyLeaveRequests(userId, filters) {
        return this.leavesService.getLeaveRequests(filters, userId);
    }
    async getPendingApprovals(userId) {
        return this.leavesService.getPendingApprovals(userId);
    }
    async getLeaveRequest(id) {
        return this.leavesService.getLeaveRequestById(id);
    }
    async createLeaveRequest(userId, createDto) {
        return this.leavesService.createLeaveRequest(userId, createDto);
    }
    async updateLeaveRequest(id, userId, updateDto) {
        return this.leavesService.updateLeaveRequest(id, userId, updateDto);
    }
    async approveLeaveRequest(id, approverId, approveDto) {
        return this.leavesService.approveLeaveRequest(id, approverId, approveDto);
    }
    async cancelLeaveRequest(id, userId) {
        return this.leavesService.cancelLeaveRequest(id, userId);
    }
    async deleteLeaveRequest(id) {
        return { message: 'Delete functionality not implemented' };
    }
    async getMyLeaveStatistics(userId) {
        const filters = {};
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
    async getDepartmentLeaveStatistics(departmentId) {
        return { message: 'Department statistics not implemented yet' };
    }
};
exports.LeavesController = LeavesController;
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getLeaveTypes", null);
__decorate([
    (0, common_1.Get)('fiscal-years'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getFiscalYears", null);
__decorate([
    (0, common_1.Get)('fiscal-years/current'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getCurrentFiscalYear", null);
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('fiscal_year_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getMyLeaveBalance", null);
__decorate([
    (0, common_1.Get)('balance/:userId'),
    (0, roles_decorator_1.Roles)('supervisor', 'hr', 'admin'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('fiscal_year_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getUserLeaveBalance", null);
__decorate([
    (0, common_1.Put)('balance'),
    (0, roles_decorator_1.Roles)('hr', 'admin'),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.UpdateLeaveBalanceDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "updateLeaveBalance", null);
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, user_decorator_1.CurrentUser)('id')),
    __param(1, (0, user_decorator_1.CurrentUser)('role')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, leave_dto_1.LeaveRequestFilterDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getLeaveRequests", null);
__decorate([
    (0, common_1.Get)('requests/my'),
    __param(0, (0, user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, leave_dto_1.LeaveRequestFilterDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getMyLeaveRequests", null);
__decorate([
    (0, common_1.Get)('requests/pending-approvals'),
    (0, roles_decorator_1.Roles)('supervisor', 'hr', 'admin'),
    __param(0, (0, user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Get)('requests/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getLeaveRequest", null);
__decorate([
    (0, common_1.Post)('requests'),
    __param(0, (0, user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, leave_dto_1.CreateLeaveRequestDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "createLeaveRequest", null);
__decorate([
    (0, common_1.Put)('requests/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, leave_dto_1.UpdateLeaveRequestDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "updateLeaveRequest", null);
__decorate([
    (0, common_1.Put)('requests/:id/approve'),
    (0, roles_decorator_1.Roles)('supervisor', 'hr', 'admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, leave_dto_1.ApproveLeaveRequestDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "approveLeaveRequest", null);
__decorate([
    (0, common_1.Put)('requests/:id/cancel'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "cancelLeaveRequest", null);
__decorate([
    (0, common_1.Delete)('requests/:id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "deleteLeaveRequest", null);
__decorate([
    (0, common_1.Get)('statistics/my'),
    __param(0, (0, user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getMyLeaveStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/department/:departmentId'),
    (0, roles_decorator_1.Roles)('supervisor', 'hr', 'admin'),
    __param(0, (0, common_1.Param)('departmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getDepartmentLeaveStatistics", null);
exports.LeavesController = LeavesController = __decorate([
    (0, common_1.Controller)('api/leaves'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [leaves_service_1.LeavesService])
], LeavesController);
//# sourceMappingURL=leaves.controller.js.map