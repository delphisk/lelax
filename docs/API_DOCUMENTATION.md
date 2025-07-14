# API Documentation - ระบบวันลาราชการ

## Overview
ระบบวันลาราชการ (Government Leave Management System) เป็น REST API ที่ออกแบบมาสำหรับจัดการวันลาของข้าราชการ รองรับปีงบประมาณไทย (1 ตุลาคม - 30 กันยายน)

## Base URL
```
http://localhost:3000/api
```

## Authentication
ระบบใช้ JWT (JSON Web Token) สำหรับ authentication

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## User Roles
- **employee**: ข้าราชการทั่วไป
- **supervisor**: หัวหน้างาน
- **hr**: เจ้าหน้าที่บุคคล
- **admin**: ผู้ดูแลระบบ

---

## Authentication Endpoints

### Login
เข้าสู่ระบบ

**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "emp001",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 4,
    "username": "emp001",
    "employee_id": "EMP001",
    "first_name": "สมชาย",
    "last_name": "ใจดี",
    "email": "employee@government.local",
    "department_name": "กองคลัง",
    "position_name": "นักบริหารงานทั่วไป 5",
    "role": "employee"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-12-08T10:30:00.000Z"
}
```

### Logout
ออกจากระบบ

**POST** `/auth/logout`

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Logout successful"
}
```

### Get Profile
ดูข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน

**GET** `/auth/me`

**Headers:** Authorization required

**Response:**
```json
{
  "user": {
    "id": 4,
    "username": "emp001",
    "first_name": "สมชาย",
    "last_name": "ใจดี",
    "department_name": "กองคลัง",
    "leave_balances": [
      {
        "leave_type_name": "ลาพักผ่อน",
        "total_days": 10,
        "used_days": 1,
        "remaining_days": 9
      }
    ]
  }
}
```

---

## Leave Management Endpoints

### Get Leave Balance
ดูยอดวันลาคงเหลือ

**GET** `/leaves/balance`

**Query Parameters:**
- `fiscal_year_id` (optional): รหัสปีงบประมาণ

**Headers:** Authorization required

**Response:**
```json
{
  "fiscal_year": {
    "id": 3,
    "name": "2568",
    "start_date": "2024-10-01",
    "end_date": "2025-09-30",
    "is_active": true
  },
  "leave_balances": [
    {
      "id": 16,
      "leave_type_id": 1,
      "total_days": 10,
      "used_days": 1,
      "remaining_days": 9,
      "leave_type_name": "ลาพักผ่อน",
      "leave_type_code": "VACATION"
    }
  ]
}
```

### Get Leave Requests
ดูรายการคำขอลา

**GET** `/leaves/requests`

**Query Parameters:**
- `status` (optional): pending, approved, denied
- `fiscal_year_id` (optional): รหัสปีงบประมาณ
- `page` (optional): หน้า (default: 1)
- `limit` (optional): จำนวนต่อหน้า (default: 10)

**Headers:** Authorization required

**Response:**
```json
{
  "requests": [
    {
      "id": 1,
      "user_id": 4,
      "leave_type_id": 1,
      "start_date": "2024-11-15",
      "end_date": "2024-11-15",
      "days_count": 1,
      "reason": "มีธุระส่วนตัว",
      "status": "approved",
      "first_name": "สมชาย",
      "last_name": "ใจดี",
      "leave_type_name": "ลาพักผ่อน",
      "supervisor_first_name": "สมศักดิ์",
      "supervisor_last_name": "ใจซื่อ"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Create Leave Request
ส่งคำขอลา

**POST** `/leaves/requests`

**Headers:** Authorization required

**Request Body:**
```json
{
  "leave_type_id": 1,
  "start_date": "2024-12-20",
  "end_date": "2024-12-22",
  "reason": "ลาพักผ่อนช่วงปีใหม่"
}
```

**Response:**
```json
{
  "message": "Leave request created successfully",
  "request": {
    "id": 3,
    "user_id": 4,
    "leave_type_id": 1,
    "fiscal_year_id": 3,
    "start_date": "2024-12-20",
    "end_date": "2024-12-22",
    "days_count": 3,
    "reason": "ลาพักผ่อนช่วงปีใหม่",
    "status": "pending",
    "leave_type_name": "ลาพักผ่อน"
  }
}
```

### Update Leave Request (Approve/Deny)
อนุมัติหรือปฏิเสธคำขอลา (สำหรับ supervisor, hr, admin)

**PUT** `/leaves/requests/:id`

**Headers:** Authorization required

**Request Body:**
```json
{
  "status": "approved",
  "supervisor_comment": "อนุมัติ"
}
```

**Response:**
```json
{
  "message": "Leave request approved successfully",
  "request": {
    "id": 3,
    "status": "approved",
    "supervisor_comment": "อนุมัติ",
    "first_name": "สมชาย",
    "last_name": "ใจดี",
    "leave_type_name": "ลาพักผ่อน"
  }
}
```

### Get Pending Approvals
ดูคำขอที่รออนุมัติ (สำหรับ supervisor, hr, admin)

**GET** `/leaves/pending-approvals`

**Query Parameters:**
- `page` (optional): หน้า (default: 1)
- `limit` (optional): จำนวนต่อหน้า (default: 10)

**Headers:** Authorization required

**Response:**
```json
{
  "pending_requests": [
    {
      "id": 2,
      "user_id": 5,
      "start_date": "2024-11-20",
      "end_date": "2024-11-21",
      "days_count": 2,
      "reason": "ป่วยไข้หวัด",
      "status": "pending",
      "first_name": "สมหมาย",
      "last_name": "ใจงาม",
      "employee_id": "EMP002",
      "leave_type_name": "ลาป่วย",
      "department_name": "กองช่าง"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get Leave Types
ดูประเภทการลาทั้งหมด

**GET** `/leaves/types`

**Headers:** Authorization required

**Response:**
```json
{
  "leave_types": [
    {
      "id": 1,
      "name": "ลาพักผ่อน",
      "code": "VACATION",
      "max_days_per_year": 10,
      "description": "ลาพักผ่อนประจำปี",
      "requires_document": false
    }
  ]
}
```

### Get Fiscal Years
ดูปีงบประมาณทั้งหมด

**GET** `/leaves/fiscal-years`

**Headers:** Authorization required

**Response:**
```json
{
  "fiscal_years": [
    {
      "id": 3,
      "name": "2568",
      "start_date": "2024-10-01",
      "end_date": "2025-09-30",
      "is_active": true
    }
  ]
}
```

---

## Reports Endpoints

### Get Leave Statistics
ดูสถิติการลาส่วนตัว

**GET** `/reports/statistics`

**Query Parameters:**
- `fiscal_year_id` (optional): รหัสปีงบประมาณ

**Headers:** Authorization required

**Response:**
```json
{
  "fiscal_year": {
    "id": 3,
    "name": "2568"
  },
  "statistics": [
    {
      "leave_type_name": "ลาพักผ่อน",
      "total_days": 10,
      "used_days": 1,
      "remaining_days": 9,
      "total_requests": 1,
      "approved_requests": 1,
      "pending_requests": 0,
      "denied_requests": 0
    }
  ]
}
```

### Get Summary Report
ดูรายงานสรุปองค์กร (สำหรับ hr, admin)

**GET** `/reports/summary`

**Query Parameters:**
- `fiscal_year_id` (optional): รหัสปีงบประมาณ

**Headers:** Authorization required

**Response:**
```json
{
  "fiscal_year": {
    "id": 3,
    "name": "2568"
  },
  "overall_statistics": {
    "total_employees": 5,
    "total_requests": 2,
    "pending_requests": 1,
    "approved_requests": 1,
    "denied_requests": 0,
    "total_approved_days": 1
  },
  "department_statistics": [
    {
      "id": 1,
      "department_name": "กองบุคคล",
      "total_employees": 2,
      "total_requests": 0,
      "total_approved_days": 0
    }
  ]
}
```

---

## User Management Endpoints

### Get All Users
ดูรายการผู้ใช้ทั้งหมด (สำหรับ hr, admin)

**GET** `/users`

**Query Parameters:**
- `page` (optional): หน้า (default: 1)
- `limit` (optional): จำนวนต่อหน้า (default: 10)
- `department_id` (optional): กรองตามแผนก
- `role` (optional): กรองตามบทบาท
- `search` (optional): ค้นหาชื่อหรือรหัสพนักงาน

**Headers:** Authorization required

**Response:**
```json
{
  "users": [
    {
      "id": 4,
      "username": "emp001",
      "employee_id": "EMP001",
      "first_name": "สมชาย",
      "last_name": "ใจดี",
      "email": "employee@government.local",
      "role": "employee",
      "department_name": "กองคลัง",
      "position_name": "นักบริหารงานทั่วไป 5"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error title",
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `INVALID_CREDENTIALS`: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
- `TOKEN_EXPIRED`: Token หมดอายุ
- `INSUFFICIENT_PERMISSIONS`: สิทธิ์ไม่เพียงพอ
- `VALIDATION_ERROR`: ข้อมูลที่ส่งไม่ถูกต้อง
- `USER_NOT_FOUND`: ไม่พบผู้ใช้
- `INSUFFICIENT_BALANCE`: วันลาไม่เพียงพอ

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## Rate Limiting
- Window: 15 minutes
- Max requests: 100 per IP
- Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Database Schema

### Key Tables
1. **users**: ข้อมูลผู้ใช้
2. **leave_types**: ประเภทการลา
3. **leave_requests**: คำขอลา
4. **leave_balances**: ยอดวันลาคงเหลือ
5. **fiscal_years**: ปีงบประมาณ
6. **departments**: แผนก
7. **positions**: ตำแหน่ง

### Fiscal Year Calculation
ปีงบประมาณไทย: 1 ตุลาคม - 30 กันยายน
- ปี 2568 = 1 ตุลาคม 2024 - 30 กันยายน 2025