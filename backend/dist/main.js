"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const helmet = require('helmet');
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.use(helmet());
    app.enableCors({
        origin: configService.get('CORS_ORIGIN', 'http://localhost:8080'),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('');
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`🚀 Government Leave Management API is running on: http://localhost:${port}`);
    console.log(`📖 API Documentation available at: http://localhost:${port}/api`);
}
bootstrap().catch((error) => {
    console.error('❌ Error starting server:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map