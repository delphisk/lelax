import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [LeavesService],
})
export class LeavesModule {}