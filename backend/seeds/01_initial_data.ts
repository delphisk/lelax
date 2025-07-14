import { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('user_sessions').del();
  await knex('leave_requests').del();
  await knex('leave_balances').del();
  await knex('fiscal_years').del();
  await knex('leave_types').del();
  
  // Remove foreign key constraint temporarily
  await knex.schema.alterTable('departments', (table) => {
    table.dropForeign(['manager_id']);
  });
  
  await knex('users').del();
  await knex('positions').del();
  await knex('departments').del();

  // Insert departments
  const departments = [
    { id: 1, name: 'ฝ่ายบุคคล', code: 'HR', created_at: new Date(), updated_at: new Date() },
    { id: 2, name: 'ฝ่ายการเงิน', code: 'FIN', created_at: new Date(), updated_at: new Date() },
    { id: 3, name: 'ฝ่ายเทคโนโลยี', code: 'IT', created_at: new Date(), updated_at: new Date() },
    { id: 4, name: 'ฝ่ายการศึกษา', code: 'EDU', created_at: new Date(), updated_at: new Date() },
    { id: 5, name: 'ฝ่ายสาธารณสุข', code: 'HEALTH', created_at: new Date(), updated_at: new Date() },
  ];
  await knex('departments').insert(departments);

  // Insert positions
  const positions = [
    { id: 1, name: 'เจ้าหน้าที่', level: 1, created_at: new Date(), updated_at: new Date() },
    { id: 2, name: 'เจ้าหน้าที่อาวุโส', level: 2, created_at: new Date(), updated_at: new Date() },
    { id: 3, name: 'หัวหน้างาน', level: 3, created_at: new Date(), updated_at: new Date() },
    { id: 4, name: 'ผู้อำนวยการ', level: 4, created_at: new Date(), updated_at: new Date() },
    { id: 5, name: 'รองผู้อำนวยการ', level: 5, created_at: new Date(), updated_at: new Date() },
  ];
  await knex('positions').insert(positions);

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Insert users
  const users = [
    {
      id: 1,
      employee_id: 'ADMIN001',
      username: 'admin',
      password: hashedPassword,
      first_name: 'ผู้ดูแล',
      last_name: 'ระบบ',
      email: 'admin@government.go.th',
      phone: '02-123-4567',
      department_id: 1,
      position_id: 4,
      role: 'admin',
      hire_date: '2020-01-01',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      employee_id: 'HR001',
      username: 'hr001',
      password: hashedPassword,
      first_name: 'สุภาพร',
      last_name: 'จันทร์เพ็ญ',
      email: 'suphaporn.j@government.go.th',
      phone: '02-123-4568',
      department_id: 1,
      position_id: 3,
      role: 'hr',
      hire_date: '2020-03-15',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      employee_id: 'SUP001',
      username: 'sup001',
      password: hashedPassword,
      first_name: 'วิชาญ',
      last_name: 'ศรีสมบูรณ์',
      email: 'wichan.s@government.go.th',
      phone: '02-123-4569',
      department_id: 3,
      position_id: 3,
      role: 'supervisor',
      hire_date: '2019-06-01',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      employee_id: 'EMP001',
      username: 'emp001',
      password: hashedPassword,
      first_name: 'ณัฐวุฒิ',
      last_name: 'อรุณเรือง',
      email: 'nattawut.a@government.go.th',
      phone: '02-123-4570',
      department_id: 3,
      position_id: 1,
      role: 'employee',
      hire_date: '2021-02-15',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      employee_id: 'EMP002',
      username: 'emp002',
      password: hashedPassword,
      first_name: 'ปริยา',
      last_name: 'มณีรัตน์',
      email: 'priya.m@government.go.th',
      phone: '02-123-4571',
      department_id: 2,
      position_id: 2,
      role: 'employee',
      hire_date: '2020-08-01',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  await knex('users').insert(users);

  // Update departments with manager_id
  await knex('departments').where('id', 1).update({ manager_id: 2, updated_at: new Date() });
  await knex('departments').where('id', 3).update({ manager_id: 3, updated_at: new Date() });

  // Re-add foreign key constraint
  await knex.schema.alterTable('departments', (table) => {
    table.foreign('manager_id').references('id').inTable('users');
  });

  // Insert leave types
  const leaveTypes = [
    {
      id: 1,
      name: 'ลาพักผ่อน',
      code: 'VACATION',
      annual_quota: 10,
      can_carryover: true,
      max_carryover_days: 5,
      requires_medical_cert: false,
      advance_notice_days: 3,
      max_consecutive_days: 5,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      name: 'ลาป่วย',
      code: 'SICK',
      annual_quota: 30,
      can_carryover: false,
      max_carryover_days: 0,
      requires_medical_cert: true,
      advance_notice_days: 0,
      max_consecutive_days: 7,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      name: 'ลากิจ',
      code: 'PERSONAL',
      annual_quota: 5,
      can_carryover: false,
      max_carryover_days: 0,
      requires_medical_cert: false,
      advance_notice_days: 1,
      max_consecutive_days: 3,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      name: 'ลาคลอด',
      code: 'MATERNITY',
      annual_quota: 90,
      can_carryover: false,
      max_carryover_days: 0,
      requires_medical_cert: true,
      advance_notice_days: 30,
      max_consecutive_days: 90,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      name: 'ลาศึกษา',
      code: 'STUDY',
      annual_quota: 365,
      can_carryover: false,
      max_carryover_days: 0,
      requires_medical_cert: false,
      advance_notice_days: 60,
      max_consecutive_days: 365,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 6,
      name: 'ลาบวช',
      code: 'ORDINATION',
      annual_quota: 120,
      can_carryover: false,
      max_carryover_days: 0,
      requires_medical_cert: false,
      advance_notice_days: 30,
      max_consecutive_days: 120,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  await knex('leave_types').insert(leaveTypes);

  // Insert fiscal years
  const fiscalYears = [
    {
      id: 1,
      year: 2566,
      start_date: '2022-10-01',
      end_date: '2023-09-30',
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      year: 2567,
      start_date: '2023-10-01',
      end_date: '2024-09-30',
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      year: 2568,
      start_date: '2024-10-01',
      end_date: '2025-09-30',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  await knex('fiscal_years').insert(fiscalYears);

  // Insert leave balances for current fiscal year (2568)
  const leaveBalances: any[] = [];
  const currentFiscalYear = 3; // 2568

  for (const user of users) {
    for (const leaveType of leaveTypes) {
      leaveBalances.push({
        user_id: user.id,
        fiscal_year_id: currentFiscalYear,
        leave_type_id: leaveType.id,
        opening_balance: leaveType.annual_quota,
        earned_days: 0,
        used_days: 0,
        carried_over: 0,
        remaining_balance: leaveType.annual_quota,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }
  await knex('leave_balances').insert(leaveBalances);

  // Insert some sample leave requests
  const sampleRequests = [
    {
      user_id: 4,
      leave_type_id: 1, // Vacation
      start_date: '2024-12-20',
      end_date: '2024-12-22',
      total_days: 3,
      reason: 'ขอลาพักผ่อนช่วงปีใหม่',
      status: 'pending',
      supervisor_id: 3,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: 5,
      leave_type_id: 2, // Sick
      start_date: '2024-12-01',
      end_date: '2024-12-01',
      total_days: 1,
      reason: 'ป่วยเป็นไข้หวัด',
      status: 'approved',
      supervisor_id: 2,
      supervisor_comment: 'อนุมัติ หายป่วยแล้วมาทำงาน',
      approved_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: 4,
      leave_type_id: 3, // Personal
      start_date: '2024-11-15',
      end_date: '2024-11-15',
      total_days: 1,
      reason: 'ไปธุรกิจส่วนตัว',
      status: 'approved',
      supervisor_id: 3,
      supervisor_comment: 'อนุมัติ',
      approved_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  await knex('leave_requests').insert(sampleRequests);

  // Update leave balances to reflect approved leave requests
  await knex('leave_balances')
    .where('user_id', 5)
    .where('leave_type_id', 2)
    .where('fiscal_year_id', currentFiscalYear)
    .update({
      used_days: 1,
      remaining_balance: knex.raw('opening_balance + earned_days + carried_over - 1'),
      updated_at: new Date(),
    });

  await knex('leave_balances')
    .where('user_id', 4)
    .where('leave_type_id', 3)
    .where('fiscal_year_id', currentFiscalYear)
    .update({
      used_days: 1,
      remaining_balance: knex.raw('opening_balance + earned_days + carried_over - 1'),
      updated_at: new Date(),
    });

  console.log('✅ Database seeded successfully');
  console.log('📋 Test accounts created:');
  console.log('   - admin/password123 (Admin)');
  console.log('   - hr001/password123 (HR)');
  console.log('   - sup001/password123 (Supervisor)');
  console.log('   - emp001/password123 (Employee)');
  console.log('   - emp002/password123 (Employee)');
}