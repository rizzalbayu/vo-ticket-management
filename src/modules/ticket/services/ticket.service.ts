import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  TicketHistoryModel,
  TicketModel,
  TicketPaginationModel,
} from '../models/ticket.model';
import { TicketRepository } from '../repositories/ticket.repository';
import {
  AssigneeTicketPerformanceQueryDto,
  GetTicketQueryDto,
  TicketCreateRequestDto,
  TicketUpdateRequestDto,
  TicketUpdateStatustDto,
  TicketUpdateUserDto,
} from '../dtos/ticket.dto';
import { RESPONSE_MESSAGE } from '../../../shared/constants/response-message.constant';
import { TicketStatusRepository } from '../repositories/ticket-status.repository';
import { TicketStatusModel } from '../models/ticket-status.model';
import * as moment from 'moment';
import { UserManagementService } from '../../../shared/adapters/user-management/user-management.service';
import {
  AssigneeUserTicketDetailDto,
  TicketDetailResponseDto,
  TicketHistoryDto,
  TicketPaginationDto,
  TicketPerformanceResponseDto,
  TicketSummaryResponseDto,
} from '../dtos/ticket-response.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly ticketStatusRepository: TicketStatusRepository,
    private readonly userService: UserManagementService,
    @Inject('TICKET_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) {}

  async getAllTicket(
    queryParams: GetTicketQueryDto,
  ): Promise<TicketPaginationDto> {
    const tickets = await this.ticketRepository.getAllTicket(queryParams);
    return this.toTicketPaginationDto(tickets);
  }

  async getAllTicketStatus(): Promise<TicketStatusModel[]> {
    return await this.ticketStatusRepository.getAllTicketStatus();
  }

  async getDetailTicket(id: string): Promise<TicketDetailResponseDto> {
    const ticket = await this.ticketRepository.getDetailTicketById(id);
    if (!ticket) {
      throw new HttpException(
        RESPONSE_MESSAGE.TICKET_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const assigneeUser = await this.userService.getDetailUser(
      ticket.assigneeId,
    );
    return this.toTicketDetailDto(ticket, assigneeUser);
  }

  async createTicket(
    ticketCreateRequest: TicketCreateRequestDto,
  ): Promise<TicketModel> {
    const ticketStatus = await this.ticketStatusRepository.getTicketStatusById(
      ticketCreateRequest.statusId,
    );
    if (!ticketStatus) {
      throw new HttpException(
        RESPONSE_MESSAGE.TICKET_STATUS_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const changerUser = await this.userService.getDetailUser(
      ticketCreateRequest.changerId,
    );
    const ticket = await this.ticketRepository.createTicket(
      ticketCreateRequest,
      changerUser,
    );
    this.rabbitClient.emit('ticket_update', ticket);
    return ticket;
  }

  async editTicket(
    ticketUpdateRequest: TicketUpdateRequestDto,
    ticketId: string,
  ): Promise<TicketModel> {
    await this.getDetailTicket(ticketId);
    const changerUser = await this.userService.getDetailUser(
      ticketUpdateRequest.changerId,
    );
    const ticket = await this.ticketRepository.editTicket(
      ticketUpdateRequest,
      ticketId,
      changerUser,
    );

    this.rabbitClient.emit('ticket_update', ticket);
    return ticket;
  }

  async editStatusTicket(
    ticketUpdateRequest: TicketUpdateStatustDto,
    ticketId: string,
  ): Promise<TicketModel> {
    await this.getDetailTicket(ticketId);
    const ticketStatus = await this.ticketStatusRepository.getTicketStatusById(
      ticketUpdateRequest.statusId,
    );
    if (!ticketStatus) {
      throw new HttpException(
        RESPONSE_MESSAGE.TICKET_STATUS_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const changerUser = await this.userService.getDetailUser(
      ticketUpdateRequest.changerId,
    );
    const ticket = await this.ticketRepository.editStatusTicket(
      ticketUpdateRequest,
      ticketId,
      ticketStatus,
      changerUser,
    );

    this.rabbitClient.emit('ticket_update', ticket);
    return ticket;
  }

  async editUserTicket(
    ticketUpdateRequest: TicketUpdateUserDto,
    ticketId: string,
  ): Promise<TicketModel> {
    await this.getDetailTicket(ticketId);
    const changerUser = await this.userService.getDetailUser(
      ticketUpdateRequest.changerId,
    );
    const ticket = await this.ticketRepository.editUserTicket(
      ticketUpdateRequest,
      ticketId,
      changerUser,
    );

    this.rabbitClient.emit('ticket_update', ticket);
    return ticket;
  }

  async getSummaryAssignee(
    assigneeId: string,
  ): Promise<TicketSummaryResponseDto> {
    const tickets =
      await this.ticketRepository.getSummaryAssigneeTicket(assigneeId);
    const statuses = await this.ticketStatusRepository.getAllTicketStatus();

    return tickets.length > 0
      ? this.toTicketSummaryDto(tickets, statuses)
      : null;
  }

  async getPerformanceAssignee(
    assigneeId: string,
    queryParams: AssigneeTicketPerformanceQueryDto,
  ): Promise<TicketPerformanceResponseDto> {
    let endDate = moment().utc();
    if (endDate.day() === 0) {
      endDate = endDate.endOf('day');
    } else {
      // Get next Sunday
      endDate = endDate.clone().weekday(7).endOf('day');
    }

    const startDate = endDate
      .clone()
      .subtract(queryParams.totalWeeks, 'weeks')
      .add(1, 'day');
    const tickets = await this.ticketRepository.getPerformanceAssigneeTicket(
      assigneeId,
      new Date(startDate.toDate()),
      new Date(endDate.toDate()),
    );
    const status =
      await this.ticketStatusRepository.getTicketStatusHighestSequence();

    return tickets.length > 0
      ? this.toTicketPerformanceDto(tickets, status)
      : null;
  }

  toTicketListDto(ticket: TicketModel, assignee: any): TicketDetailResponseDto {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status.title,
      point: ticket.point,
      userId: ticket.userId,
      assignee: assignee ? this.toAssigneeUserDto(assignee) : ticket.assigneeId,
    };
  }

  async toTicketDetailDto(
    ticket: TicketModel,
    assignee: any,
  ): Promise<TicketDetailResponseDto> {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status.title,
      point: ticket.point,
      userId: ticket.userId,
      assignee: assignee ? this.toAssigneeUserDto(assignee) : ticket.userId,
      ticketHistories: await this.toTicketHistoriesDto(ticket.ticketHistories),
    };
  }

  async toTicketHistoriesDto(
    historyTickets: TicketHistoryModel[],
  ): Promise<TicketHistoryDto[]> {
    const histories: TicketHistoryDto[] = [];
    for (const history of historyTickets) {
      let user = null;
      if (history.user) {
        const userData = await this.userService.getDetailUser(history.user);
        user = userData.name;
      }
      const historyDetail = {
        id: history.id,
        date: history.date,
        title: history.title,
        user,
      };
      histories.push(historyDetail);
    }
    return histories;
  }

  toAssigneeUserDto(assignee: any): AssigneeUserTicketDetailDto {
    return {
      id: assignee.id,
      name: assignee.name,
      profilePicture: assignee.profilePicture,
    };
  }

  toTicketSummaryDto(
    tickets: TicketModel[],
    ticketStatuses: TicketStatusModel[],
  ): TicketSummaryResponseDto {
    const summary = [];

    for (const status of ticketStatuses) {
      const ticket = tickets.filter((ticket) => ticket.status.id === status.id);
      let count = 0;
      let point = 0;
      if (ticket.length > 0) {
        count = ticket.length;
        point = ticket.reduce((acc, cur) => acc + cur.point, 0);
      }
      summary.push({
        title: status.title,
        count,
        point,
      });
    }
    return {
      assigneeId: tickets[0].assigneeId,
      summary,
    };
  }

  toTicketPerformanceDto(
    tickets: TicketModel[],
    ticketStatus: TicketStatusModel,
  ): TicketPerformanceResponseDto {
    const totalPoint = tickets.reduce((acc, cur) => acc + cur.point, 0);
    const totalTask = tickets.length;
    const completedTask = tickets.filter(
      (ticket) => ticket.status.id === ticketStatus.id,
    ).length;
    const completedPoint = tickets.filter(
      (ticket) => ticket.status.id === ticketStatus.id,
    ).length;

    return {
      assigneeId: tickets[0].assigneeId,
      completedTask,
      unCompletedTask: totalTask - completedTask,
      totalTask,
      completedTaskPercentage: completedTask / totalTask || 0,
      completedPoint,
      unCompletedPoint: totalPoint - completedPoint,
      totalPoint: totalPoint,
      completedPointPercentage: completedPoint / completedPoint || 0,
    };
  }

  async toTicketPaginationDto(
    tickets: TicketPaginationModel,
  ): Promise<TicketPaginationDto> {
    const items: TicketDetailResponseDto[] = [];

    for (const ticket of tickets.items) {
      const assignee = await this.userService.getDetailUser(ticket.assigneeId);
      const item = this.toTicketListDto(ticket, assignee);
      items.push(item);
    }

    return {
      total: tickets.total,
      items,
    };
  }
}
