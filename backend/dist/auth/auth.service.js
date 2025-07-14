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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const database_service_1 = require("../database/database.service");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    constructor(jwtService, configService, usersService, databaseService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
        this.databaseService = databaseService;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.is_active) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });
        await this.createUserSession(user.id, refreshToken);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                username: user.username,
                employee_id: user.employee_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                department_id: user.department_id,
                position_id: user.position_id,
            },
        };
    }
    async validateUser(username, password) {
        try {
            const user = await this.usersService.findByUsername(username);
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const { password, ...result } = user;
                return result;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const knex = this.databaseService.getKnex();
            const session = await knex('user_sessions')
                .where('user_id', payload.sub)
                .where('token', refreshToken)
                .where('is_active', true)
                .where('expires_at', '>', new Date())
                .first();
            if (!session) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const user = await this.usersService.findById(payload.sub);
            const newPayload = {
                sub: user.id,
                username: user.username,
                role: user.role,
            };
            const accessToken = this.jwtService.sign(newPayload);
            return {
                access_token: accessToken,
                user: {
                    id: user.id,
                    username: user.username,
                    employee_id: user.employee_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                    department_id: user.department_id,
                    position_id: user.position_id,
                },
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId, refreshToken) {
        const knex = this.databaseService.getKnex();
        await knex('user_sessions')
            .where('user_id', userId)
            .where('token', refreshToken)
            .update({ is_active: false, updated_at: new Date() });
        return { message: 'Logged out successfully' };
    }
    async logoutAll(userId) {
        const knex = this.databaseService.getKnex();
        await knex('user_sessions')
            .where('user_id', userId)
            .update({ is_active: false, updated_at: new Date() });
        return { message: 'Logged out from all devices successfully' };
    }
    async changePassword(userId, changePasswordDto) {
        await this.usersService.changePassword(userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
        await this.logoutAll(userId);
        return { message: 'Password changed successfully' };
    }
    async createUserSession(userId, token) {
        const knex = this.databaseService.getKnex();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        return knex('user_sessions').insert({
            user_id: userId,
            token,
            expires_at: expiresAt,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        });
    }
    async getActiveSessions(userId) {
        const knex = this.databaseService.getKnex();
        return knex('user_sessions')
            .select('id', 'created_at', 'expires_at')
            .where('user_id', userId)
            .where('is_active', true)
            .where('expires_at', '>', new Date())
            .orderBy('created_at', 'desc');
    }
    async revokeSession(userId, sessionId) {
        const knex = this.databaseService.getKnex();
        await knex('user_sessions')
            .where('user_id', userId)
            .where('id', sessionId)
            .update({ is_active: false, updated_at: new Date() });
        return { message: 'Session revoked successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService,
        database_service_1.DatabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map