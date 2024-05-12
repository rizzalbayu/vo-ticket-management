export const HISTORY_TITLE = {
  TICKET_CREATED: 'Ticket Created',
  TICKET_CHANGE_USER: (user: string, type: string) =>
    `Change ${type} To ${user}`,
  TICKET_CHANGE_STATUS: (user: string, status: string) =>
    `${user} Change Status To ${status}`,
  TICKET_EDITED: (user: string) => `Edited by ${user}`,
};
