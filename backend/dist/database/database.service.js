"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const knex_1 = require("knex");
const moment_1 = __importDefault(require("moment"));
let DatabaseService = class DatabaseService {
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        this.knexInstance = (0, knex_1.knex)({
            client: 'mysql2',
            connection: {
                host: this.configService.get('DB_HOST', 'localhost'),
                port: this.configService.get('DB_PORT', 3306),
                user: this.configService.get('DB_USER', 'root'),
                password: this.configService.get('DB_PASSWORD', ''),
                database: this.configService.get('DB_NAME', 'government_leave_db'),
                charset: 'utf8mb4',
            },
            pool: {
                min: 2,
                max: 10,
            },
        });
        try {
            await this.knexInstance.raw('SELECT 1');
            console.log('✅ Connected to MySQL database successfully');
        }
        catch (error) {
            console.error('❌ Database connection failed:', error instanceof Error ? error.message : error);
            throw error;
        }
    }
    getKnex() {
        return this.knexInstance;
    }
    getCurrentFiscalYear() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const fiscalYearStart = new Date(currentYear, 9, 1);
        if (now >= fiscalYearStart) {
            return {
                year: currentYear + 543 + 1,
                startDate: new Date(currentYear, 9, 1),
                endDate: new Date(currentYear + 1, 8, 30)
            };
        }
        else {
            return {
                year: currentYear + 543,
                startDate: new Date(currentYear - 1, 9, 1),
                endDate: new Date(currentYear, 8, 30)
            };
        }
    }
    formatDate(date) {
        return (0, moment_1.default)(date).format('YYYY-MM-DD');
    }
    formatDateTime(date) {
        return (0, moment_1.default)(date).format('YYYY-MM-DD HH:mm:ss');
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map