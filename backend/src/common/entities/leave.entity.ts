export interface LeaveType {
  id: number;
  name: string;
  code: string;
  annual_quota: number;
  can_carryover: boolean;
  max_carryover_days: number;
  requires_medical_cert: boolean;
  advance_notice_days: number;
  max_consecutive_days: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FiscalYear {
  id: number;
  year: number;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveBalance {
  id: number;
  user_id: number;
  fiscal_year_id: number;
  leave_type_id: number;
  opening_balance: number;
  earned_days: number;
  used_days: number;
  carried_over: number;
  remaining_balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  leave_type_id: number;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  supervisor_id?: number;
  supervisor_comment?: string;
  hr_id?: number;
  hr_comment?: string;
  approved_at?: Date;
  medical_certificate?: string;
  attachments?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}