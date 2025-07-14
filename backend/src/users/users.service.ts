import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User, Department, Position } from '../common/entities/user.entity';
import { CreateUserDto } from '../common/dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async findAll(): Promise<User[]> {
    const knex = this.databaseService.getKnex();
    return knex('users')
      .select(
        'users.*',
        'departments.name as department_name',
        'positions.name as position_name'
      )
      .leftJoin('departments', 'users.department_id', 'departments.id')
      .leftJoin('positions', 'users.position_id', 'positions.id')
      .where('users.is_active', true);
  }

  async findById(id: number): Promise<User> {
    const knex = this.databaseService.getKnex();
    const user = await knex('users')
      .select(
        'users.*',
        'departments.name as department_name',
        'positions.name as position_name'
      )
      .leftJoin('departments', 'users.department_id', 'departments.id')
      .leftJoin('positions', 'users.position_id', 'positions.id')
      .where('users.id', id)
      .first();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const knex = this.databaseService.getKnex();
    const user = await knex('users')
      .select('*')
      .where('username', username)
      .first();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmployeeId(employeeId: string): Promise<User> {
    const knex = this.databaseService.getKnex();
    const user = await knex('users')
      .select('*')
      .where('employee_id', employeeId)
      .first();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const knex = this.databaseService.getKnex();

    // Check if username or employee_id already exists
    const existingUser = await knex('users')
      .where('username', createUserDto.username)
      .orWhere('employee_id', createUserDto.employee_id)
      .first();

    if (existingUser) {
      throw new ConflictException('Username or employee ID already exists');
    }

    // Hash password
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

  async update(id: number, updateData: Partial<User>): Promise<User> {
    const knex = this.databaseService.getKnex();

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
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

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    const knex = this.databaseService.getKnex();
    const user = await this.findById(id);

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await knex('users')
      .where('id', id)
      .update({
        password: hashedNewPassword,
        updated_at: new Date(),
      });
  }

  async deactivate(id: number): Promise<void> {
    const knex = this.databaseService.getKnex();
    await knex('users')
      .where('id', id)
      .update({
        is_active: false,
        updated_at: new Date(),
      });
  }

  async getDepartments(): Promise<Department[]> {
    const knex = this.databaseService.getKnex();
    return knex('departments')
      .select('*')
      .where('is_active', true)
      .orderBy('name');
  }

  async getPositions(): Promise<Position[]> {
    const knex = this.databaseService.getKnex();
    return knex('positions')
      .select('*')
      .where('is_active', true)
      .orderBy('level');
  }

  async getUsersByDepartment(departmentId: number): Promise<User[]> {
    const knex = this.databaseService.getKnex();
    return knex('users')
      .select(
        'users.*',
        'departments.name as department_name',
        'positions.name as position_name'
      )
      .leftJoin('departments', 'users.department_id', 'departments.id')
      .leftJoin('positions', 'users.position_id', 'positions.id')
      .where('users.department_id', departmentId)
      .where('users.is_active', true);
  }

  async getSupervisors(): Promise<User[]> {
    const knex = this.databaseService.getKnex();
    return knex('users')
      .select(
        'users.*',
        'departments.name as department_name',
        'positions.name as position_name'
      )
      .leftJoin('departments', 'users.department_id', 'departments.id')
      .leftJoin('positions', 'users.position_id', 'positions.id')
      .where('users.role', 'supervisor')
      .orWhere('users.role', 'hr')
      .orWhere('users.role', 'admin')
      .where('users.is_active', true);
  }
}