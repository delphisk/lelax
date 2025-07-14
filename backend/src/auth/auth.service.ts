import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users/users.service';
import { LoginDto, ChangePasswordDto } from '../common/dto/auth.dto';
import { JwtPayload } from './jwt.strategy';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private databaseService: DatabaseService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' }
    );

    // Store session in database
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

  async validateUser(username: string, password: string) {
    try {
      const user = await this.usersService.findByUsername(username);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken);
      
      // Check if session exists and is active
      const knex = this.databaseService.getKnex();
      const session = await knex('user_sessions')
        .where('user_id', payload.sub)
        .where('token', refreshToken)
        .where('is_active', true)
        .where('expires_at', '>', new Date())
        .first();

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      
      const newPayload: JwtPayload = {
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
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number, refreshToken: string) {
    const knex = this.databaseService.getKnex();
    
    // Deactivate the specific session
    await knex('user_sessions')
      .where('user_id', userId)
      .where('token', refreshToken)
      .update({ is_active: false, updated_at: new Date() });

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: number) {
    const knex = this.databaseService.getKnex();
    
    // Deactivate all sessions for the user
    await knex('user_sessions')
      .where('user_id', userId)
      .update({ is_active: false, updated_at: new Date() });

    return { message: 'Logged out from all devices successfully' };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    await this.usersService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );

    // Logout all sessions to force re-login with new password
    await this.logoutAll(userId);

    return { message: 'Password changed successfully' };
  }

  private async createUserSession(userId: number, token: string) {
    const knex = this.databaseService.getKnex();
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return knex('user_sessions').insert({
      user_id: userId,
      token,
      expires_at: expiresAt,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async getActiveSessions(userId: number) {
    const knex = this.databaseService.getKnex();
    
    return knex('user_sessions')
      .select('id', 'created_at', 'expires_at')
      .where('user_id', userId)
      .where('is_active', true)
      .where('expires_at', '>', new Date())
      .orderBy('created_at', 'desc');
  }

  async revokeSession(userId: number, sessionId: number) {
    const knex = this.databaseService.getKnex();
    
    await knex('user_sessions')
      .where('user_id', userId)
      .where('id', sessionId)
      .update({ is_active: false, updated_at: new Date() });

    return { message: 'Session revoked successfully' };
  }
}