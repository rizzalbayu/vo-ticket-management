import { Module } from '@nestjs/common';
import { TicketController } from './controllers/ticket.controller';
import { TicketService } from './services/ticket.service';
import { TicketRepository } from './repositories/ticket.repository';
import { PrismaService } from '../../shared/adapters/prisma/prisma.service';
import { TicketStatusRepository } from './repositories/ticket-status.repository';
import { UserManagementModule } from '../../shared/adapters/user-management/user-management.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'TICKET_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE'),
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
    UserManagementModule,
  ],
  controllers: [TicketController],
  providers: [
    PrismaService,
    TicketService,
    TicketRepository,
    TicketStatusRepository,
  ],
})
export class TicketModule {}
