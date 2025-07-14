import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto, ChangePasswordDto, RefreshTokenDto } from '../common/dto/auth.dto';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
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
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
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
    logout(userId: number, body: {
        refreshToken: string;
    }): Promise<{
        message: string;
    }>;
    logoutAll(userId: number): Promise<{
        message: string;
    }>;
    getProfile(userId: number): Promise<{
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
    changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getActiveSessions(userId: number): Promise<any[]>;
    revokeSession(userId: number, body: {
        sessionId: number;
    }): Promise<{
        message: string;
    }>;
}
