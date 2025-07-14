import { DatabaseService } from '../database/database.service';
import { User, Department, Position } from '../common/entities/user.entity';
import { CreateUserDto } from '../common/dto/auth.dto';
export declare class UsersService {
    private databaseService;
    constructor(databaseService: DatabaseService);
    findAll(): Promise<User[]>;
    findById(id: number): Promise<User>;
    findByUsername(username: string): Promise<User>;
    findByEmployeeId(employeeId: string): Promise<User>;
    create(createUserDto: CreateUserDto): Promise<User>;
    update(id: number, updateData: Partial<User>): Promise<User>;
    changePassword(id: number, currentPassword: string, newPassword: string): Promise<void>;
    deactivate(id: number): Promise<void>;
    getDepartments(): Promise<Department[]>;
    getPositions(): Promise<Position[]>;
    getUsersByDepartment(departmentId: number): Promise<User[]>;
    getSupervisors(): Promise<User[]>;
}
