# Setup Guide - ระบบวันลาราชการ

## ภาพรวมโครงการ

ระบบวันลาราชการ (Government Leave Management System) เป็นระบบจัดการวันลาสำหรับข้าราชการ ที่รองรับปีงบประมาณไทย (1 ตุลาคม - 30 กันยายน) 

### เทคโนโลยีที่ใช้

**Backend:**
- Node.js + Express.js
- MySQL Database
- JWT Authentication
- Bcrypt.js สำหรับเข้ารหัสรหัสผ่าน
- Moment.js สำหรับจัดการวันที่
- Joi สำหรับ validation

**Frontend:**
- Vue.js 3 + Composition API
- Vuex สำหรับ state management
- Vue Router สำหรับ routing
- Tailwind CSS สำหรับ styling
- Axios สำหรับ HTTP requests

## ความต้องการของระบบ

### Software Requirements
- Node.js >= 16.0.0
- MySQL >= 8.0
- npm หรือ yarn

### Hardware Requirements (สำหรับ Development)
- RAM: 4GB+
- Storage: 2GB+ available space
- CPU: 2 cores+

## การติดตั้ง

### 1. Clone Repository
```bash
git clone <repository-url>
cd government-leave-system
```

### 2. ติดตั้ง Backend

```bash
# เข้าไปใน backend directory
cd backend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env จาก .env.example
cp .env.example .env

# แก้ไขไฟล์ .env ตามการตั้งค่าของคุณ
nano .env
```

#### การตั้งค่า Environment Variables (.env)
```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=government_leave_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

### 3. ตั้งค่า MySQL Database

```sql
-- เข้า MySQL และสร้าง database
CREATE DATABASE government_leave_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- สร้าง user สำหรับ application (optional)
CREATE USER 'leave_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON government_leave_db.* TO 'leave_app'@'localhost';
FLUSH PRIVILEGES;
```

### 4. รัน Database Migration และ Seeding

```bash
# รัน migration เพื่อสร้างตาราง
npm run migrate

# รัน seeding เพื่อใส่ข้อมูลเริ่มต้น
npm run seed
```

### 5. ติดตั้ง Frontend

```bash
# เข้าไปใน frontend directory
cd ../frontend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env สำหรับ frontend
cp .env.example .env

# แก้ไขไฟล์ .env หากจำเป็น
nano .env
```

#### การตั้งค่า Frontend Environment Variables
```env
VUE_APP_API_URL=http://localhost:3000/api
VUE_APP_NAME=ระบบวันลาราชการ
VUE_APP_VERSION=1.0.0
```

## การรันระบบ

### Development Mode

#### Terminal 1: รัน Backend
```bash
cd backend
npm run dev
```
เซิร์ฟเวอร์จะรันที่ `http://localhost:3000`

#### Terminal 2: รัน Frontend
```bash
cd frontend
npm run serve
```
เว็บไซต์จะรันที่ `http://localhost:8080`

### Production Mode

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# จากนั้นให้ serve ไฟล์ที่ build แล้วด้วย web server เช่น nginx
```

## ข้อมูลเริ่มต้นสำหรับทดสอบ

หลังจาก seed ข้อมูลแล้ว คุณสามารถใช้ user accounts เหล่านี้เพื่อทดสอบ:

### Admin Account
- **Username:** admin
- **Password:** password123
- **Role:** admin
- **สิทธิ์:** เข้าถึงทุกฟีเจอร์

### HR Account
- **Username:** hr001
- **Password:** password123
- **Role:** hr
- **สิทธิ์:** จัดการผู้ใช้, ดูรายงาน, อนุมัติลา

### Supervisor Account
- **Username:** sup001
- **Password:** password123
- **Role:** supervisor
- **สิทธิ์:** อนุมัติลาในสังกัด, ดูรายงานทีม

### Employee Accounts
- **Username:** emp001 / **Password:** password123
- **Username:** emp002 / **Password:** password123
- **Role:** employee
- **สิทธิ์:** ส่งคำขอลา, ดูข้อมูลส่วนตัว

## โครงสร้างไฟล์

```
government-leave-system/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── controllers/     # API Controllers
│   │   ├── models/          # Database Models
│   │   ├── routes/          # API Routes
│   │   ├── middleware/      # Custom Middleware
│   │   ├── config/          # Configuration Files
│   │   └── utils/           # Utility Functions
│   ├── migrations/          # Database Migrations
│   ├── seeders/            # Database Seeders
│   └── package.json
├── frontend/               # Vue.js Application
│   ├── src/
│   │   ├── components/     # Reusable Components
│   │   ├── views/          # Page Components
│   │   ├── store/          # Vuex Store
│   │   ├── router/         # Vue Router
│   │   ├── services/       # API Services
│   │   └── assets/         # Static Assets
│   └── package.json
├── docs/                   # Documentation
│   ├── API_DOCUMENTATION.md
│   └── SETUP_GUIDE.md
└── README.md
```

## ฟีเจอร์หลัก

### สำหรับข้าราชการ (Employee)
- ✅ ดูยอดวันลาคงเหลือตามปีงบประมาณ
- ✅ ส่งคำขอลาใหม่
- ✅ ดูประวัติการลา
- ✅ ติดตามสถานะคำขอลา
- ✅ ดูข้อมูลส่วนตัว

### สำหรับหัวหน้างาน (Supervisor)
- ✅ อนุมัติ/ปฏิเสธคำขอลาในสังกัด
- ✅ ดูรายการคำขอที่รออนุมัติ
- ✅ ดูรายงานทีมงาน
- ✅ ฟีเจอร์ทั้งหมดของข้าราชการ

### สำหรับเจ้าหน้าที่บุคคล (HR)
- ✅ จัดการข้อมูลผู้ใช้ทั้งหมด
- ✅ ดูรายงานสถิติองค์กร
- ✅ อนุมัติคำขอลาทุกแผนก
- ✅ ออกรายงานตามแผนก
- ✅ ฟีเจอร์ทั้งหมดของ Supervisor

### สำหรับผู้ดูแลระบบ (Admin)
- ✅ จัดการระบบทั้งหมด
- ✅ จัดการสิทธิ์ผู้ใช้
- ✅ ฟีเจอร์ทั้งหมดของ HR

## API Endpoints

### Authentication
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/logout` - ออกจากระบบ
- `GET /api/auth/me` - ดูข้อมูลโปรไฟล์

### Leave Management
- `GET /api/leaves/balance` - ดูยอดวันลาคงเหลือ
- `GET /api/leaves/requests` - ดูรายการคำขอลา
- `POST /api/leaves/requests` - ส่งคำขอลาใหม่
- `PUT /api/leaves/requests/:id` - อนุมัติ/ปฏิเสธคำขอลา
- `GET /api/leaves/pending-approvals` - ดูคำขอที่รออนุมัติ

### Reports
- `GET /api/reports/statistics` - ดูสถิติการลา
- `GET /api/reports/summary` - ดูรายงานสรุปองค์กร

### User Management
- `GET /api/users` - ดูรายการผู้ใช้ทั้งหมด
- `POST /api/users` - สร้างผู้ใช้ใหม่
- `PUT /api/users/:id` - แก้ไขข้อมูลผู้ใช้

## Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. ไม่สามารถเชื่อมต่อ Database
```bash
# ตรวจสอบว่า MySQL รันอยู่
sudo systemctl status mysql

# ตรวจสอบการตั้งค่า .env
cat backend/.env
```

#### 2. CORS Error
```bash
# ตรวจสอบ CORS_ORIGIN ในไฟล์ .env
CORS_ORIGIN=http://localhost:8080
```

#### 3. JWT Token Error
```bash
# ตรวจสอบ JWT_SECRET ในไฟล์ .env
JWT_SECRET=your-secret-key
```

#### 4. Port Already in Use
```bash
# หา process ที่ใช้ port
lsof -i :3000
lsof -i :8080

# ปิด process
kill -9 <PID>
```

### ปิด Debug Mode
สำหรับ production ให้เปลี่ยน:
```env
NODE_ENV=production
```

## การ Deploy

### Backend (Node.js)
1. ติดตั้ง PM2 process manager
```bash
npm install -g pm2
pm2 start src/app.js --name "government-leave-api"
```

2. ตั้งค่า Nginx reverse proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Frontend (Vue.js)
```bash
# Build สำหรับ production
npm run build

# Deploy ไฟล์ใน dist/ ไปยัง web server
```

## Security Considerations

1. **เปลี่ยน JWT_SECRET** ในสภาพแวดล้อม production
2. **ใช้ HTTPS** สำหรับ production
3. **ตั้งค่า rate limiting** ให้เหมาะสม
4. **ใช้ strong passwords** สำหรับ database
5. **อัปเดต dependencies** อย่างสม่ำเสมอ

## การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
- ตรวจสอบ logs ในโฟลเดอร์ logs/
- ดู API Documentation ใน docs/API_DOCUMENTATION.md
- ตรวจสอบ Network tab ใน browser developer tools

## ใบอนุญาต

MIT License - ดูรายละเอียดในไฟล์ LICENSE