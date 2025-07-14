import { UsersService } from './users.service';
import { CreateUserDto } from '../common/dto/auth.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("../common/entities/user.entity").User[]>;
    getDepartments(): Promise<import("../common/entities/user.entity").Department[]>;
    getPositions(): Promise<import("../common/entities/user.entity").Position[]>;
    getSupervisors(): Promise<import("../common/entities/user.entity").User[]>;
    getUsersByDepartment(departmentId: number): Promise<import("../common/entities/user.entity").User[]>;
    findOne(id: number): Promise<import("../common/entities/user.entity").User>;
    create(createUserDto: CreateUserDto): Promise<import("../common/entities/user.entity").User>;
    update(id: number, updateData: any): Promise<import("../common/entities/user.entity").User>;
    deactivate(id: number): Promise<{
        message: string;
    }>;
    getMyProfile(userId: number): Promise<import("../common/entities/user.entity").User>;
    updateMyProfile(userId: number, updateData: any): Promise<import("../common/entities/user.entity").User>;
}
