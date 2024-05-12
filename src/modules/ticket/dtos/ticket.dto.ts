import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserTicketType } from '../../../shared/enums/ticket.enum';

export class TicketCreateRequestDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  point: number;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  assigneeId: string;

  @IsString()
  @IsNotEmpty()
  statusId: string;

  @IsString()
  @IsNotEmpty()
  changerId: string;
}

export class TicketUpdateRequestDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  point: number;

  @IsString()
  @IsNotEmpty()
  changerId: string;
}

export class TicketUpdateStatustDto {
  @IsNotEmpty()
  statusId: string;

  @IsString()
  @IsNotEmpty()
  changerId: string;
}

export class TicketUpdateUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(UserTicketType)
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  changerId: string;
}

export class AssigneeTicketPerformanceQueryDto {
  @IsString()
  @IsNotEmpty()
  totalWeeks: number;
}

export class GetTicketQueryDto {
  @IsOptional()
  page: number = 1;
  @IsOptional()
  size: number = 10;
}
