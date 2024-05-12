import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/adapters/prisma/prisma.service';
import {
  TicketHistoryModel,
  TicketModel,
  TicketPaginationModel,
} from '../models/ticket.model';
import {
  GetTicketQueryDto,
  TicketCreateRequestDto,
  TicketUpdateRequestDto,
  TicketUpdateStatustDto,
  TicketUpdateUserDto,
} from '../dtos/ticket.dto';
import { TicketHistory } from '@prisma/client';
import * as moment from 'moment';
import { HISTORY_TITLE } from '../../../shared/constants/history.constant';
import { capitalEachWord } from '../../../shared/utils/common.util';
import { UserTicketType } from '../../../shared/enums/ticket.enum';
import { TicketStatusModel } from '../models/ticket-status.model';
import { TicketStatusRepository } from './ticket-status.repository';

@Injectable()
export class TicketRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly ticketStatusRepository: TicketStatusRepository,
  ) {}
  async getAllTicket(
    queryParams: GetTicketQueryDto,
  ): Promise<TicketPaginationModel> {
    const tickets = await this.prismaService.ticket.findMany({
      orderBy: {
        created_at: 'desc',
      },
      include: {
        status: true,
      },
      skip: (queryParams.page - 1) * queryParams.size,
      take: +queryParams.size,
    });
    const total = await this.prismaService.ticket.count({
      where: {
        deleted_at: null,
      },
    });
    return {
      items: tickets.map((ticket) => this.toTicketModel(ticket)),
      total,
    };
  }

  async getSummaryAssigneeTicket(assigneeId: string): Promise<TicketModel[]> {
    const tickets = await this.prismaService.ticket.findMany({
      where: {
        assignee_id: assigneeId,
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        status: true,
      },
    });

    return tickets.map((ticket) => this.toTicketModel(ticket));
  }

  async getPerformanceAssigneeTicket(
    assigneeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TicketModel[]> {
    const tickets = await this.prismaService.ticket.findMany({
      where: {
        assignee_id: assigneeId,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        status: true,
      },
    });

    return tickets.map((ticket) => this.toTicketModel(ticket));
  }

  async getDetailTicketById(id: string): Promise<TicketModel> {
    const ticket = await this.prismaService.ticket.findUnique({
      where: {
        id: id,
      },
      include: {
        ticketHistories: {
          orderBy: {
            created_at: 'asc',
          },
        },
        status: true,
      },
    });
    if (!ticket) return null;
    return this.toTicketDetailModel(ticket);
  }

  async createTicket(
    ticketCreateRequest: TicketCreateRequestDto,
    changerUser: any,
  ): Promise<TicketModel> {
    const transaction = await this.prismaService.$transaction(async () => {
      const ticket = await this.prismaService.ticket.create({
        data: {
          title: ticketCreateRequest.title,
          description: ticketCreateRequest.description,
          point: ticketCreateRequest.point,
          user_id: ticketCreateRequest.userId,
          assignee_id: ticketCreateRequest.assigneeId,
          ticket_status_id: ticketCreateRequest.statusId,
        },
      });

      await this.prismaService.ticketHistory.create({
        data: {
          ticket_id: ticket.id,
          title: HISTORY_TITLE.TICKET_CREATED,
          user_id: changerUser.id,
        },
      });
      return this.toTicketModel(ticket);
    });
    return transaction;
  }

  async editTicket(
    ticketUpdateRequest: TicketUpdateRequestDto,
    ticketId: string,
    changerUser: any,
  ): Promise<TicketModel> {
    const transaction = await this.prismaService.$transaction(async () => {
      const ticket = await this.prismaService.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          title: ticketUpdateRequest.title,
          description: ticketUpdateRequest.description,
          point: ticketUpdateRequest.point,
        },
      });

      await this.prismaService.ticketHistory.create({
        data: {
          ticket_id: ticket.id,
          title: HISTORY_TITLE.TICKET_EDITED(changerUser.name),
          user_id: changerUser.id,
        },
      });
      return this.toTicketModel(ticket);
    });
    return transaction;
  }
  async editStatusTicket(
    ticketUpdateRequest: TicketUpdateStatustDto,
    ticketId: string,
    status: TicketStatusModel,
    changerUser: any,
  ): Promise<TicketModel> {
    const transaction = await this.prismaService.$transaction(async () => {
      const ticket = await this.prismaService.ticket.update({
        where: {
          id: ticketId,
        },
        data: { ticket_status_id: ticketUpdateRequest.statusId },
      });

      await this.prismaService.ticketHistory.create({
        data: {
          ticket_id: ticket.id,
          title: HISTORY_TITLE.TICKET_CHANGE_STATUS(
            changerUser.name,
            status.title,
          ),
          user_id: changerUser.id,
        },
      });
      return this.toTicketModel(ticket);
    });
    return transaction;
  }

  async editUserTicket(
    ticketUpdateRequest: TicketUpdateUserDto,
    ticketId: string,
    changerUser: any,
  ): Promise<TicketModel> {
    const transaction = await this.prismaService.$transaction(async () => {
      let data = null;
      switch (ticketUpdateRequest.type) {
        case UserTicketType.ASSIGNEE:
          data = {
            assignee_id: ticketUpdateRequest.userId,
          };
          break;
        case UserTicketType.REPORTER:
          data = {
            user_id: ticketUpdateRequest.userId,
          };
          break;

        default:
          break;
      }
      const ticket = await this.prismaService.ticket.update({
        where: {
          id: ticketId,
        },
        data,
      });

      await this.prismaService.ticketHistory.create({
        data: {
          ticket_id: ticket.id,
          title: HISTORY_TITLE.TICKET_CHANGE_USER(
            changerUser.name,
            capitalEachWord(ticketUpdateRequest.type),
          ),
          user_id: changerUser.id,
        },
      });
      return this.toTicketModel(ticket);
    });
    return transaction;
  }

  toTicketModel(ticket: any): TicketModel {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status:
        this.ticketStatusRepository.toTicketStatusModel(ticket?.status) || null,
      point: ticket.point,
      userId: ticket.user_id,
      assigneeId: ticket.assignee_id,
    };
  }

  toTicketDetailModel(ticket: any): TicketModel {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: this.ticketStatusRepository.toTicketStatusModel(ticket.status),
      point: ticket.point,
      userId: ticket.user_id,
      assigneeId: ticket.assignee_id,
      ticketHistories: ticket.ticketHistories.map((history) =>
        this.toTicketHistoyModel(history),
      ),
    };
  }

  toTicketHistoyModel(ticket: TicketHistory): TicketHistoryModel {
    const date = moment(ticket.created_at).format('DD MMM YYYY');
    return {
      id: ticket.id,
      date,
      title: ticket.title,
      user: 'dummy',
    };
  }
}
