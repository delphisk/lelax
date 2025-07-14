export declare class LoginDto {
    username: string;
    password: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class CreateUserDto {
    employee_id: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    department_id: string;
    position_id: string;
    role: 'employee' | 'supervisor' | 'hr' | 'admin';
    hire_date: string;
}
