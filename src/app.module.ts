import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketModule } from './modules/ticket/ticket.module';
import { PrismaModule } from './shared/adapters/prisma/prisma.module';
import { UserManagementModule } from './shared/adapters/user-management/user-management.module';

@Module({
  imports: [TicketModule, PrismaModule, UserManagementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
