# ระบบวันลาราชการ (Government Leave Management System)

## 📋 ภาพรวมระบบ

ระบบจัดการวันลาสำหรับข้าราชการที่สามารถตรวจสอบข้อมูลส่วนตัว สถิติการลา และจัดการคำขอลาตามปีงบประมาณ (1 ตุลาคม - 30 กันยายน)

## 🎯 ฟีเจอร์หลัก

- ✅ ตรวจสอบข้อมูลวันลาตามปีงบประมาณ
- ✅ ดูสถิติการลา (ลาป่วย, ลากิจ, ลาพักร้อน)
- ✅ ดูรายละเอียดการลารายวัน
- ✅ ระบบผู้ใช้แยกตามบทบาท (ข้าราชการ, หัวหน้างาน, HR)
- ✅ รองรับการขออนุมัติลาผ่านระบบ

## 🏗️ สถาปัตยกรรมระบบ

```
government-leave-system/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Business Logic
│   │   ├── models/          # Database Models
│   │   ├── routes/          # API Routes
│   │   ├── middleware/      # Authentication & Validation
│   │   ├── config/          # Database & App Configuration
│   │   └── utils/           # Helper Functions
│   ├── migrations/          # Database Migrations
│   └── seeders/            # Sample Data
├── frontend/               # Vue.js Application
│   ├── src/
│   │   ├── components/     # Reusable Components
│   │   ├── views/          # Page Components
│   │   ├── store/          # Vuex State Management
│   │   ├── router/         # Vue Router
│   │   ├── services/       # API Services
│   │   └── utils/          # Helper Functions
│   └── public/             # Static Assets
└── docs/                   # Documentation
```

## 🚀 การติดตั้งและรัน

### Backend (API Server)
```bash
cd backend
npm install
npm run migrate
npm run seed
npm start
```

### Frontend (Vue.js App)
```bash
cd frontend
npm install
npm run serve
```

## 📊 ตารางฐานข้อมูล

### users
- id, username, password, first_name, last_name, employee_id, department_id, position_id, role

### leave_types
- id, name, max_days_per_year, description

### leave_requests
- id, user_id, leave_type_id, start_date, end_date, days_count, reason, status, fiscal_year_id

### leave_balances
- id, user_id, leave_type_id, fiscal_year_id, total_days, used_days, remaining_days

### fiscal_years
- id, name, start_date, end_date, is_active

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/logout` - ออกจากระบบ

### Leave Management
- `GET /api/leaves/balance` - ยอดวันลาคงเหลือ
- `GET /api/leaves/requests` - รายการคำขอลา
- `POST /api/leaves/requests` - ส่งคำขอลา
- `PUT /api/leaves/requests/:id` - อนุมัติ/ปฏิเสธคำขอลา

### Reports
- `GET /api/reports/statistics` - สถิติการลา
- `GET /api/reports/department/:id` - รายงานตามแผนก

## 👥 บทบาทผู้ใช้

### ข้าราชการ (Employee)
- ดูข้อมูลวันลาส่วนตัว
- ส่งคำขอลา
- ติดตามสถานะคำขอลา

### หัวหน้างาน (Supervisor)
- อนุมัติ/ปฏิเสธคำขอลาในสังกัด
- ดูรายงานทีม

### เจ้าหน้าที่บุคคล (HR)
- ดูรายงานทั้งองค์กร
- จัดการสิทธิ์ผู้ใช้
- ออกรายงานสถิติ

## 🎨 UI/UX Design

- **ธีม**: โทนสีขาว-ดำ เรียบง่าย
- **Framework**: Vue.js 3 + Composition API
- **CSS**: Tailwind CSS
- **Components**: Professional และ Responsive Design

## 📱 หน้าจอหลัก

1. **Dashboard** - สรุปวันลาปีงบประมาณ
2. **Leave Requests** - จัดการคำขอลา
3. **Leave History** - ประวัติการลา
4. **Reports** - รายงานและสถิติ
5. **Profile** - ข้อมูลส่วนตัว

## 🔒 Security Features

- JWT Authentication
- Role-based Access Control
- Input Validation
- SQL Injection Protection
- XSS Protection