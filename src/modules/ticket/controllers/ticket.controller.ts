import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import {
  RESPONSE_MESSAGE,
  RESPONSE_STATUS,
} from '../../../shared/constants/response-message.constant';
import {
  AssigneeTicketPerformanceQueryDto,
  GetTicketQueryDto,
  TicketCreateRequestDto,
  TicketUpdateRequestDto,
  TicketUpdateStatustDto,
  TicketUpdateUserDto,
} from '../dtos/ticket.dto';

@Controller('v1/tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  async GetAllTickets(
    @Query(new ValidationPipe({ transform: true }))
    queryParams: GetTicketQueryDto,
  ) {
    const tickets = await this.ticketService.getAllTicket(queryParams);
    return {
      status: RESPONSE_STATUS.SUCCESS,
      message: RESPONSE_MESSAGE.SUCCESS,
      data: {
        items: tickets.items,
        page: +queryParams.page,
        size: +queryParams.size,
        totalItems: tickets.total,
        totalPages: Math.ceil(tickets.total / queryParams.size),
      },
    };
  }

  @Get('status')
  async GetAllTicketStatuses() {
    const tickets = await this.ticketService.getAllTicketStatus();
    return {
      status: RESPONSE_STATUS.SUCCESS,
      message: RESPONSE_MESSAGE.SUCCESS,
      data: tickets,
    };
  }

  @Get('summary/:assigneeId')
  async GetSummaryAssignee(@Param('assigneeId') assigneeId: string) {
    const tickets = await this.ticketService.getSummaryAssignee(assigneeId);
    return {
      status: RESPONSE_STATUS.SUCCESS,
      message: RESPONSE_MESSAGE.SUCCESS,
      data: tickets,
    };
  }

  @Get('performance/:assigneeId')
  async GetPerformanceAssignee(
    @Param('assigneeId') assigneeId: string,
    @Query(new ValidationPipe({ transform: true }))
    queryParams: AssigneeTicketPerformanceQueryDto,
  ) {
    const tickets = await this.ticketService.getPerformanceAssignee(
      assigneeId,
      queryParams,
    );
    return {
      status: RESPONSE_STATUS.SUCCESS,
      message: RESPONSE_MESSAGE.SUCCESS,
      data: tickets,
    };
  }

  @Get('/:ticketId')
  async GetDetailTickets(@Param('ticketId') ticketId: string) {
    const ticket = await this.ticketService.getDetailTicket(ticketId);
    return {
      status: RESPONSE_STATUS.SUCCESS,
      message: RESPONSE_MESSAGE.SUCCESS,
      data: ticket,
    };
  }

  @Post()
  async CreateTicket(@Body() ticketCreateRequest: TicketCreateRequestDto) {
    await this.ticketService.createTicket(ticketCreateRequest);
    return {
      status: RESPONSE_STATUS.SUCCESS,
      message: RESPONSE_MESSAGE.SUCCESS,
      data: null,
    };
  }

  @Put('/:ticketId/status')
  async EditTicketStatus(
    @Param('ticketId') ticketId: string,
    @Body() ticketUpdateRequest: TicketUpdateStatustDto,
  ) {
    await this.ticketService.editStatusTicket(ticketUpdateRequest, ticketId);
    return {
      status: RESPONSE_STATUS.SUCCESS,
      message: RESPONSE_MESSAGE.SUCCESS,
      data: null,
    };
  }

  @Put('/:ticketId/user')
  async EditUserTicket(
    @Param('ticketId') ticketId: string,
    @Body() ticketUpdateRequest: TicketUpdateUserDto,
  ) {
    await this.ticketService.editUserTicket(ticketUpdateRequest, ticketId);
    return {
      status: RESPONSE_STATUS.SUCCESS,
      message: RESPONSE_MESSAGE.SUCCESS,
      data: null,
    };
  }

  @Put('/:ticketId')
  async EditTicket(
    @Param('ticketId') ticketId: string,
    @Body() ticketUpdateRequest: TicketUpdateRequestDto,
  ) {
    await this.ticketService.editTicket(ticketUpdateRequest, ticketId);
    return {
      status: RESPONSE_STATUS.SUCCESS,
      message: RESPONSE_MESSAGE.SUCCESS,
      data: null,
    };
  }
}
