import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex, knex } from 'knex';
import moment from 'moment';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private knexInstance: Knex;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.knexInstance = knex({
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

    // Test connection
    try {
      await this.knexInstance.raw('SELECT 1');
      console.log('✅ Connected to MySQL database successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  getKnex(): Knex {
    return this.knexInstance;
  }

  // Helper method to get current fiscal year
  getCurrentFiscalYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const fiscalYearStart = new Date(currentYear, 9, 1); // October 1st
    
    if (now >= fiscalYearStart) {
      return {
        year: currentYear + 543 + 1, // Thai Buddhist year + 1 for next fiscal year
        startDate: new Date(currentYear, 9, 1),
        endDate: new Date(currentYear + 1, 8, 30)
      };
    } else {
      return {
        year: currentYear + 543,
        startDate: new Date(currentYear - 1, 9, 1),
        endDate: new Date(currentYear, 8, 30)
      };
    }
  }

  // Helper method to format dates for database
  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  // Helper method to format datetime for database
  formatDateTime(date: Date): string {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }
}