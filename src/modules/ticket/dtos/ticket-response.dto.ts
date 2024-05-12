export class TicketSummaryResponseDto {
  assigneeId: string;
  summary: any[];
}

export class TicketPerformanceResponseDto {
  assigneeId: string;
  completedTask: number;
  unCompletedTask: number;
  totalTask: number;
  completedTaskPercentage: number;
  completedPoint: number;
  unCompletedPoint: number;
  totalPoint: number;
  completedPointPercentage: number;
}

export class TicketDetailResponseDto {
  id: string;
  title: string;
  description: string;
  status?: string;
  point: number;
  userId?: string;
  assignee: AssigneeUserTicketDetailDto;
  ticketHistories?: TicketHistoryDto[];
}

export class AssigneeUserTicketDetailDto {
  id: string;
  name: string;
  profilePicture: string;
}

export class TicketHistoryDto {
  id: string;
  date: string;
  title: string;
  user: string;
}

export class TicketPaginationDto {
  total: number;
  items: TicketDetailResponseDto[];
}
