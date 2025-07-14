export interface User {
  id: number;
  employee_id: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: number;
  position_id: number;
  role: 'employee' | 'supervisor' | 'hr' | 'admin';
  hire_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  manager_id?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Position {
  id: number;
  name: string;
  level: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}