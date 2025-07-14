"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async findAll() {
        const knex = this.databaseService.getKnex();
        return knex('users')
            .select('users.*', 'departments.name as department_name', 'positions.name as position_name')
            .leftJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('positions', 'users.position_id', 'positions.id')
            .where('users.is_active', true);
    }
    async findById(id) {
        const knex = this.databaseService.getKnex();
        const user = await knex('users')
            .select('users.*', 'departments.name as department_name', 'positions.name as position_name')
            .leftJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('positions', 'users.position_id', 'positions.id')
            .where('users.id', id)
            .first();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByUsername(username) {
        const knex = this.databaseService.getKnex();
        const user = await knex('users')
            .select('*')
            .where('username', username)
            .first();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmployeeId(employeeId) {
        const knex = this.databaseService.getKnex();
        const user = await knex('users')
            .select('*')
            .where('employee_id', employeeId)
            .first();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async create(createUserDto) {
        const knex = this.databaseService.getKnex();
        const existingUser = await knex('users')
            .where('username', createUserDto.username)
            .orWhere('employee_id', createUserDto.employee_id)
            .first();
        if (existingUser) {
            throw new common_1.ConflictException('Username or employee ID already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const userData = {
            ...createUserDto,
            password: hashedPassword,
            department_id: parseInt(createUserDto.department_id),
            position_id: parseInt(createUserDto.position_id),
            hire_date: new Date(createUserDto.hire_date),
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        };
        const [userId] = await knex('users').insert(userData);
        return this.findById(userId);
    }
    async update(id, updateData) {
        const knex = this.databaseService.getKnex();
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        updateData.updated_at = new Date();
        await knex('users')
            .where('id', id)
            .update(updateData);
        return this.findById(id);
    }
    async changePassword(id, currentPassword, newPassword) {
        const knex = this.databaseService.getKnex();
        const user = await this.findById(id);
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new common_1.ConflictException('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await knex('users')
            .where('id', id)
            .update({
            password: hashedNewPassword,
            updated_at: new Date(),
        });
    }
    async deactivate(id) {
        const knex = this.databaseService.getKnex();
        await knex('users')
            .where('id', id)
            .update({
            is_active: false,
            updated_at: new Date(),
        });
    }
    async getDepartments() {
        const knex = this.databaseService.getKnex();
        return knex('departments')
            .select('*')
            .where('is_active', true)
            .orderBy('name');
    }
    async getPositions() {
        const knex = this.databaseService.getKnex();
        return knex('positions')
            .select('*')
            .where('is_active', true)
            .orderBy('level');
    }
    async getUsersByDepartment(departmentId) {
        const knex = this.databaseService.getKnex();
        return knex('users')
            .select('users.*', 'departments.name as department_name', 'positions.name as position_name')
            .leftJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('positions', 'users.position_id', 'positions.id')
            .where('users.department_id', departmentId)
            .where('users.is_active', true);
    }
    async getSupervisors() {
        const knex = this.databaseService.getKnex();
        return knex('users')
            .select('users.*', 'departments.name as department_name', 'positions.name as position_name')
            .leftJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('positions', 'users.position_id', 'positions.id')
            .where('users.role', 'supervisor')
            .orWhere('users.role', 'hr')
            .orWhere('users.role', 'admin')
            .where('users.is_active', true);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map