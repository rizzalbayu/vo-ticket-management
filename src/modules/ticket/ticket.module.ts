import { Module } from '@nestjs/common';
import { TicketController } from './controllers/ticket.controller';
import { TicketService } from './services/ticket.service';
import { TicketRepository } from './repositories/ticket.repository';
import { PrismaService } from '../../shared/adapters/prisma/prisma.service';
import { TicketStatusRepository } from './repositories/ticket-status.repository';
import { UserManagementModule } from '../../shared/adapters/user-management/user-management.module';

@Module({
  imports: [UserManagementModule],
  controllers: [TicketController],
  providers: [
    PrismaService,
    TicketService,
    TicketRepository,
    TicketStatusRepository,
  ],
})
export class TicketModule {}
