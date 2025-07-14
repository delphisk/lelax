import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeavesModule } from './leaves/leaves.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
        limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
      },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    LeavesModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}