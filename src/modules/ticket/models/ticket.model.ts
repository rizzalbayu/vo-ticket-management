export class TicketModel {
  id: string;
  title: string;
  description: string;
  status?: TicketStatusModel;
  point: number;
  userId?: string;
  assigneeId?: string;
  ticketHistories?: TicketHistoryModel[];
}

export class TicketHistoryModel {
  id: string;
  date: string;
  title: string;
  user: string;
}

export class TicketStatusModel {
  id: string;
  title: string;
}

export class TicketPaginationModel {
  total: number;
  items: TicketModel[];
}
