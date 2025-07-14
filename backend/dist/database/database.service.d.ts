import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
export declare class DatabaseService implements OnModuleInit {
    private configService;
    private knexInstance;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    getKnex(): Knex;
    getCurrentFiscalYear(): {
        year: number;
        startDate: Date;
        endDate: Date;
    };
    formatDate(date: Date): string;
    formatDateTime(date: Date): string;
}
