export declare class CreateLeaveRequestDto {
    leave_type_id: number;
    start_date: string;
    end_date: string;
    reason: string;
    medical_certificate?: string;
    attachments?: string;
}
export declare class UpdateLeaveRequestDto {
    start_date?: string;
    end_date?: string;
    reason?: string;
    medical_certificate?: string;
    attachments?: string;
}
export declare class ApproveLeaveRequestDto {
    status: 'approved' | 'rejected';
    comment?: string;
}
export declare class LeaveRequestFilterDto {
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    leave_type_id?: number;
    user_id?: number;
    start_date?: string;
    end_date?: string;
    fiscal_year?: number;
}
export declare class UpdateLeaveBalanceDto {
    user_id: number;
    leave_type_id: number;
    fiscal_year_id: number;
    opening_balance?: number;
    earned_days?: number;
    carried_over?: number;
}
