import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsNumber()
  @IsNotEmpty()
  leave_type_id: number;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  medical_certificate?: string;

  @IsString()
  @IsOptional()
  attachments?: string;
}

export class UpdateLeaveRequestDto {
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  medical_certificate?: string;

  @IsString()
  @IsOptional()
  attachments?: string;
}

export class ApproveLeaveRequestDto {
  @IsString()
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @IsString()
  @IsOptional()
  comment?: string;
}

export class LeaveRequestFilterDto {
  @IsString()
  @IsOptional()
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';

  @IsNumber()
  @IsOptional()
  leave_type_id?: number;

  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsNumber()
  @IsOptional()
  fiscal_year?: number;
}

export class UpdateLeaveBalanceDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  leave_type_id: number;

  @IsNumber()
  @IsNotEmpty()
  fiscal_year_id: number;

  @IsNumber()
  @IsOptional()
  opening_balance?: number;

  @IsNumber()
  @IsOptional()
  earned_days?: number;

  @IsNumber()
  @IsOptional()
  carried_over?: number;
}