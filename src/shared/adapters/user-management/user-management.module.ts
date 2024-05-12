import { Module } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [UserManagementService, ConfigService],
  exports: [UserManagementService],
})
export class UserManagementModule {}
