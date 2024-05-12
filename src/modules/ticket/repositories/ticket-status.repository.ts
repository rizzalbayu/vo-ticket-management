import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/adapters/prisma/prisma.service';
import { TicketStatus } from '@prisma/client';
import { TicketStatusModel } from '../models/ticket-status.model';

@Injectable()
export class TicketStatusRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async getAllTicketStatus(): Promise<TicketStatusModel[]> {
    const statuses = await this.prismaService.ticketStatus.findMany({
      orderBy: {
        sequence: 'asc',
      },
    });
    return statuses.map((status) => this.toTicketStatusModel(status));
  }

  async getTicketStatusById(id: string): Promise<TicketStatusModel> {
    const status = await this.prismaService.ticketStatus.findUnique({
      where: {
        id: id,
      },
    });
    if (!status) return null;
    return this.toTicketStatusModel(status);
  }

  async getTicketStatusHighestSequence(): Promise<TicketStatusModel> {
    const status = await this.prismaService.ticketStatus.findFirst({
      orderBy: {
        sequence: 'desc',
      },
    });
    if (!status) return null;
    return this.toTicketStatusModel(status);
  }

  toTicketStatusModel(ticket: TicketStatus): TicketStatusModel {
    if (!ticket) return null;
    return {
      id: ticket.id || null,
      title: ticket.title || null,
    };
  }
}
