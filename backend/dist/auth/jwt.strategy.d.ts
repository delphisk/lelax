import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
export interface JwtPayload {
    sub: number;
    username: string;
    role: string;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: JwtPayload): Promise<{
        id: number;
        username: string;
        role: "employee" | "supervisor" | "hr" | "admin";
        employee_id: string;
        first_name: string;
        last_name: string;
        department_id: number;
        position_id: number;
    }>;
}
export {};
