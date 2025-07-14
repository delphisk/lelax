const bcrypt = require('bcryptjs');
const { executeQuery, getCurrentFiscalYear } = require('../src/config/database');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed departments
    const departments = [
      { name: 'กองบุคคล', code: 'HR', description: 'ฝ่ายทรัพยากรบุคคล' },
      { name: 'กองคลัง', code: 'FIN', description: 'ฝ่ายการเงินและบัญชี' },
      { name: 'กองช่าง', code: 'ENG', description: 'ฝ่ายวิศวกรรม' },
      { name: 'กองการศึกษา', code: 'EDU', description: 'ฝ่ายการศึกษา' },
      { name: 'กองสาธารณสุข', code: 'HEALTH', description: 'ฝ่ายสาธารณสุข' }
    ];

    for (const dept of departments) {
      await executeQuery(
        'INSERT IGNORE INTO departments (name, code, description) VALUES (?, ?, ?)',
        [dept.name, dept.code, dept.description]
      );
    }

    // Seed positions
    const positions = [
      { name: 'นักบริหารงานทั่วไป 3', level: 3 },
      { name: 'นักบริหารงานทั่วไป 4', level: 4 },
      { name: 'นักบริหารงานทั่วไป 5', level: 5 },
      { name: 'นักบริหารงานทั่วไป 6', level: 6 },
      { name: 'นักบริหารงานทั่วไป 7', level: 7 },
      { name: 'นักบริหารงานทั่วไป 8', level: 8 },
      { name: 'ผู้อำนวยการกอง', level: 9 },
      { name: 'รองนายกเทศมนตรี', level: 10 },
      { name: 'นายกเทศมนตรี', level: 11 }
    ];

    for (const pos of positions) {
      await executeQuery(
        'INSERT IGNORE INTO positions (name, level) VALUES (?, ?)',
        [pos.name, pos.level]
      );
    }

    // Seed fiscal years
    const fiscalYears = [
      { name: '2566', start_date: '2022-10-01', end_date: '2023-09-30', is_active: false },
      { name: '2567', start_date: '2023-10-01', end_date: '2024-09-30', is_active: false },
      { name: '2568', start_date: '2024-10-01', end_date: '2025-09-30', is_active: true }
    ];

    for (const fy of fiscalYears) {
      await executeQuery(
        'INSERT IGNORE INTO fiscal_years (name, start_date, end_date, is_active) VALUES (?, ?, ?, ?)',
        [fy.name, fy.start_date, fy.end_date, fy.is_active]
      );
    }

    // Seed leave types
    const leaveTypes = [
      { name: 'ลาพักผ่อน', code: 'VACATION', max_days_per_year: 10, description: 'ลาพักผ่อนประจำปี' },
      { name: 'ลาป่วย', code: 'SICK', max_days_per_year: 30, description: 'ลาป่วย', requires_document: true },
      { name: 'ลากิจ', code: 'PERSONAL', max_days_per_year: 10, description: 'ลากิจส่วนตัว' },
      { name: 'ลาคลอด', code: 'MATERNITY', max_days_per_year: 90, description: 'ลาคลอดบุตร', requires_document: true },
      { name: 'ลาศึกษา', code: 'STUDY', max_days_per_year: 365, description: 'ลาศึกษาต่อ', requires_document: true },
      { name: 'ลาอุปสมบท', code: 'ORDINATION', max_days_per_year: 90, description: 'ลาเพื่อบวช', requires_document: true }
    ];

    for (const lt of leaveTypes) {
      await executeQuery(
        'INSERT IGNORE INTO leave_types (name, code, max_days_per_year, description, requires_document) VALUES (?, ?, ?, ?, ?)',
        [lt.name, lt.code, lt.max_days_per_year, lt.description, lt.requires_document || false]
      );
    }

    // Seed sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        username: 'admin',
        password: hashedPassword,
        employee_id: 'EMP001',
        first_name: 'ผู้ดูแล',
        last_name: 'ระบบ',
        email: 'admin@government.local',
        department_id: 1,
        position_id: 7,
        role: 'admin'
      },
      {
        username: 'hr001',
        password: hashedPassword,
        employee_id: 'HR001',
        first_name: 'สมหญิง',
        last_name: 'ใจดี',
        email: 'hr@government.local',
        department_id: 1,
        position_id: 6,
        role: 'hr'
      },
      {
        username: 'sup001',
        password: hashedPassword,
        employee_id: 'SUP001',
        first_name: 'สมศักดิ์',
        last_name: 'ใจซื่อ',
        email: 'supervisor@government.local',
        department_id: 2,
        position_id: 7,
        role: 'supervisor'
      },
      {
        username: 'emp001',
        password: hashedPassword,
        employee_id: 'EMP001',
        first_name: 'สมชาย',
        last_name: 'ใจดี',
        email: 'employee@government.local',
        department_id: 2,
        position_id: 5,
        role: 'employee'
      },
      {
        username: 'emp002',
        password: hashedPassword,
        employee_id: 'EMP002',
        first_name: 'สมหมาย',
        last_name: 'ใจงาม',
        email: 'employee2@government.local',
        department_id: 3,
        position_id: 4,
        role: 'employee'
      }
    ];

    for (const user of users) {
      await executeQuery(
        'INSERT IGNORE INTO users (username, password, employee_id, first_name, last_name, email, department_id, position_id, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user.username, user.password, user.employee_id, user.first_name, user.last_name, user.email, user.department_id, user.position_id, user.role]
      );
    }

    // Get current fiscal year and create leave balances for all users
    const currentFY = await executeQuery('SELECT id FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    const allUsers = await executeQuery('SELECT id FROM users');
    const allLeaveTypes = await executeQuery('SELECT id, max_days_per_year FROM leave_types');

    if (currentFY.length > 0 && allUsers.length > 0) {
      const fiscalYearId = currentFY[0].id;

      for (const user of allUsers) {
        for (const leaveType of allLeaveTypes) {
          await executeQuery(
            'INSERT IGNORE INTO leave_balances (user_id, leave_type_id, fiscal_year_id, total_days, used_days, remaining_days) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, leaveType.id, fiscalYearId, leaveType.max_days_per_year, 0, leaveType.max_days_per_year]
          );
        }
      }
    }

    // Seed sample leave requests
    const sampleRequests = [
      {
        user_id: 4, // สมชาย
        leave_type_id: 1, // ลาพักผ่อน
        fiscal_year_id: currentFY.length > 0 ? currentFY[0].id : 3,
        start_date: '2024-11-15',
        end_date: '2024-11-15',
        days_count: 1,
        reason: 'มีธุระส่วนตัว',
        status: 'approved',
        supervisor_id: 3
      },
      {
        user_id: 5, // สมหมาย
        leave_type_id: 2, // ลาป่วย
        fiscal_year_id: currentFY.length > 0 ? currentFY[0].id : 3,
        start_date: '2024-11-20',
        end_date: '2024-11-21',
        days_count: 2,
        reason: 'ป่วยไข้หวัด',
        status: 'pending',
        supervisor_id: 3
      }
    ];

    for (const req of sampleRequests) {
      await executeQuery(
        'INSERT IGNORE INTO leave_requests (user_id, leave_type_id, fiscal_year_id, start_date, end_date, days_count, reason, status, supervisor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user_id, req.leave_type_id, req.fiscal_year_id, req.start_date, req.end_date, req.days_count, req.reason, req.status, req.supervisor_id]
      );
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('🌱 Seeded data:');
    console.log('  - 5 departments');
    console.log('  - 9 positions');
    console.log('  - 3 fiscal years');
    console.log('  - 6 leave types');
    console.log('  - 5 users (admin, hr, supervisor, 2 employees)');
    console.log('  - Leave balances for all users');
    console.log('  - 2 sample leave requests');
    console.log('');
    console.log('🔑 Default login credentials:');
    console.log('  Admin: admin / password123');
    console.log('  HR: hr001 / password123');
    console.log('  Supervisor: sup001 / password123');
    console.log('  Employee: emp001 / password123');
    console.log('  Employee: emp002 / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { seedData };