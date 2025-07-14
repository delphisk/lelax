import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users/users.service';
import { LoginDto, ChangePasswordDto } from '../common/dto/auth.dto';
export declare class AuthService {
    private jwtService;
    private configService;
    private usersService;
    private databaseService;
    constructor(jwtService: JwtService, configService: ConfigService, usersService: UsersService, databaseService: DatabaseService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: number;
            username: string;
            employee_id: string;
            first_name: string;
            last_name: string;
            email: string;
            role: "employee" | "supervisor" | "hr" | "admin";
            department_id: number;
            position_id: number;
        };
    }>;
    validateUser(username: string, password: string): Promise<{
        id: number;
        employee_id: string;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        department_id: number;
        position_id: number;
        role: "employee" | "supervisor" | "hr" | "admin";
        hire_date: Date;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            employee_id: string;
            first_name: string;
            last_name: string;
            email: string;
            role: "employee" | "supervisor" | "hr" | "admin";
            department_id: number;
            position_id: number;
        };
    }>;
    logout(userId: number, refreshToken: string): Promise<{
        message: string;
    }>;
    logoutAll(userId: number): Promise<{
        message: string;
    }>;
    changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    private createUserSession;
    getActiveSessions(userId: number): Promise<any[]>;
    revokeSession(userId: number, sessionId: number): Promise<{
        message: string;
    }>;
}
