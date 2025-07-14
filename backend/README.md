# Government Leave Management System - NestJS Backend

ระบบจัดการวันลาราชการ (Government Leave Management System) ที่พัฒนาด้วย NestJS Framework และ Knex.js สำหรับการจัดการฐานข้อมูล

## 🏗️ Architecture

- **Framework**: NestJS (TypeScript)
- **Database**: MySQL with Knex.js Query Builder
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator
- **Security**: Helmet, CORS, Rate Limiting
- **API Design**: RESTful API

## 📋 Features

### Core Functionality
- ✅ JWT Authentication with Refresh Tokens
- ✅ Role-based Access Control (Employee, Supervisor, HR, Admin)
- ✅ Thai Fiscal Year Support (October 1 - September 30)
- ✅ Leave Balance Management
- ✅ Leave Request Workflow with Approval System
- ✅ Comprehensive Reporting
- ✅ Real-time Leave Statistics

### User Roles
- **Employee**: Submit leave requests, view own balance and history
- **Supervisor**: Approve/reject department leave requests
- **HR**: Manage leave policies, view all reports, manage balances
- **Admin**: Full system access, user management

### Leave Types Supported
- ลาพักผ่อน (Vacation Leave)
- ลาป่วย (Sick Leave)
- ลากิจ (Personal Leave)
- ลาคลอด (Maternity Leave)
- ลาศึกษา (Study Leave)
- ลาบวช (Ordination Leave)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd backend
npm install
```

2. **Environment Configuration**
Copy and configure environment variables:
```bash
cp .env.example .env
```

Update `.env` with your database configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=government_leave_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

3. **Database Setup**
Create MySQL database:
```sql
CREATE DATABASE government_leave_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run migrations and seed data:
```bash
npm run migrate:latest
npm run seed:run
```

4. **Start the server**
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📊 Database Schema

### Core Tables
- **users**: Employee information and authentication
- **departments**: Organization departments
- **positions**: Job positions and levels
- **leave_types**: Types of leave with rules and quotas
- **fiscal_years**: Thai fiscal year periods
- **leave_balances**: User leave balances per fiscal year
- **leave_requests**: Leave applications and approvals
- **user_sessions**: JWT session management

### Sample Data
The seed includes 5 test accounts:
- `admin`/`password123` (Admin)
- `hr001`/`password123` (HR Staff)
- `sup001`/`password123` (Supervisor)
- `emp001`/`password123` (Employee)
- `emp002`/`password123` (Employee)

## 🛠️ API Endpoints

### Authentication
```
POST   /api/auth/login           # User login
POST   /api/auth/refresh         # Refresh access token
POST   /api/auth/logout          # Logout from current device
POST   /api/auth/logout-all      # Logout from all devices
GET    /api/auth/me              # Get current user profile
POST   /api/auth/change-password # Change password
```

### Users Management
```
GET    /api/users                # List all users (HR/Admin)
GET    /api/users/:id            # Get user by ID (HR/Admin)
POST   /api/users                # Create new user (Admin)
PUT    /api/users/:id            # Update user (HR/Admin)
DELETE /api/users/:id            # Deactivate user (Admin)
GET    /api/users/departments    # List departments
GET    /api/users/positions      # List positions
```

### Leave Management
```
GET    /api/leaves/types         # Get leave types
GET    /api/leaves/fiscal-years  # Get fiscal years
GET    /api/leaves/balance       # Get current user leave balance
PUT    /api/leaves/balance       # Update leave balance (HR/Admin)

GET    /api/leaves/requests      # Get leave requests
POST   /api/leaves/requests      # Create leave request
PUT    /api/leaves/requests/:id  # Update leave request
PUT    /api/leaves/requests/:id/approve # Approve/reject request
PUT    /api/leaves/requests/:id/cancel  # Cancel request

GET    /api/leaves/requests/pending-approvals # Pending approvals
```

### Reports
```
GET    /api/reports/statistics          # Personal leave statistics
GET    /api/reports/summary             # Organization summary (HR/Admin)
GET    /api/reports/department/:id      # Department report
GET    /api/reports/user/:id           # User report
GET    /api/reports/usage              # Leave usage trends
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in requests:

```bash
Authorization: Bearer <access_token>
```

### Login Example
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "emp001",
    "password": "password123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 4,
    "username": "emp001",
    "employee_id": "EMP001",
    "first_name": "ณัฐวุฒิ",
    "last_name": "อรุณเรือง",
    "email": "nattawut.a@government.go.th",
    "role": "employee",
    "department_id": 3,
    "position_id": 1
  }
}
```

## 📝 Development

### Available Scripts
```bash
npm run build          # Build for production
npm run start          # Start production server
npm run start:dev      # Start development server with hot reload
npm run start:debug    # Start in debug mode
npm run lint           # Run ESLint
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests

# Database commands
npm run migrate:make    # Create new migration
npm run migrate:latest  # Run pending migrations
npm run migrate:rollback # Rollback last migration
npm run seed:make       # Create new seed file
npm run seed:run        # Run seed files
```

### Project Structure
```
src/
├── auth/              # Authentication module
├── users/             # User management module
├── leaves/            # Leave management module
├── reports/           # Reporting module
├── database/          # Database service
├── common/            # Shared components
│   ├── decorators/    # Custom decorators
│   ├── dto/           # Data transfer objects
│   ├── entities/      # Database entities
│   ├── guards/        # Authentication guards
│   └── utils/         # Utility functions
├── app.module.ts      # Main application module
└── main.ts           # Application entry point

migrations/            # Database migrations
seeds/                # Database seed files
```

## 🔧 Configuration

### Environment Variables
- `DB_*`: Database connection settings
- `JWT_SECRET`: Secret key for JWT signing
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Allowed origins for CORS
- `RATE_LIMIT_*`: Rate limiting configuration

### Database Configuration
The system uses Knex.js for database operations. Configuration is in `knexfile.ts`:

```typescript
{
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  }
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Request throttling to prevent abuse
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers middleware
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries via Knex

## 📈 Monitoring

### Health Check
```bash
GET /api/health
```

### Logging
The application includes comprehensive logging for:
- Authentication attempts
- Database operations
- Error tracking
- Performance monitoring

## 🚧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Migration Errors**
   - Check database permissions
   - Verify table constraints
   - Run migrations in order

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper token format

### Debug Mode
Run with debug logging:
```bash
npm run start:debug
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Government Leave Management System - NestJS Backend**  
*Developed for Thai Government Organizations*