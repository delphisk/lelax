import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CreateUserDto } from '../common/dto/auth.dto';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('hr', 'admin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('departments')
  async getDepartments() {
    return this.usersService.getDepartments();
  }

  @Get('positions')
  async getPositions() {
    return this.usersService.getPositions();
  }

  @Get('supervisors')
  @Roles('hr', 'admin')
  async getSupervisors() {
    return this.usersService.getSupervisors();
  }

  @Get('department/:departmentId')
  @Roles('supervisor', 'hr', 'admin')
  async getUsersByDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number
  ) {
    return this.usersService.getUsersByDepartment(departmentId);
  }

  @Get(':id')
  @Roles('hr', 'admin')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @Roles('hr', 'admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any
  ) {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @Roles('admin')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deactivate(id);
    return { message: 'User deactivated successfully' };
  }

  @Get('profile/me')
  async getMyProfile(@CurrentUser('id') userId: number) {
    return this.usersService.findById(userId);
  }

  @Put('profile/me')
  async updateMyProfile(
    @CurrentUser('id') userId: number,
    @Body() updateData: any
  ) {
    // Remove sensitive fields that users shouldn't be able to update
    const { password, role, is_active, ...allowedData } = updateData;
    return this.usersService.update(userId, allowedData);
  }
}