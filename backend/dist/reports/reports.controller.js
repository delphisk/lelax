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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getPersonalStatistics(userId, fiscalYear) {
        return this.reportsService.getPersonalStatistics(userId, fiscalYear);
    }
    async getOrganizationSummary(fiscalYear) {
        return this.reportsService.getOrganizationSummary(fiscalYear);
    }
    async getDepartmentReport(departmentId, fiscalYear) {
        return this.reportsService.getDepartmentReport(departmentId, fiscalYear);
    }
    async getUserReport(userId, fiscalYear) {
        return this.reportsService.getUserReport(userId, fiscalYear);
    }
    async getLeaveUsageReport(fiscalYear) {
        return this.reportsService.getLeaveUsageReport(fiscalYear);
    }
    async getMyReport(userId, fiscalYear) {
        return this.reportsService.getUserReport(userId, fiscalYear);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('fiscal_year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPersonalStatistics", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)('hr', 'admin'),
    __param(0, (0, common_1.Query)('fiscal_year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getOrganizationSummary", null);
__decorate([
    (0, common_1.Get)('department/:departmentId'),
    (0, roles_decorator_1.Roles)('supervisor', 'hr', 'admin'),
    __param(0, (0, common_1.Param)('departmentId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('fiscal_year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDepartmentReport", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, roles_decorator_1.Roles)('supervisor', 'hr', 'admin'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('fiscal_year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getUserReport", null);
__decorate([
    (0, common_1.Get)('usage'),
    (0, roles_decorator_1.Roles)('hr', 'admin'),
    __param(0, (0, common_1.Query)('fiscal_year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getLeaveUsageReport", null);
__decorate([
    (0, common_1.Get)('my-profile'),
    __param(0, (0, user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('fiscal_year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getMyReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('api/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map