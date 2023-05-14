"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .addBearerAuth()
        .setTitle("PowerPlanner by AcademyHeroes")
        .setDescription("PowerPlanner API Endpoints. Token required to execute secured endpoints")
        .setExternalDoc("Source", "https://github.com/AcademyHeroes/projectplanner-backend")
        .setVersion("alpha-version 0.0.1")
        .setTermsOfService("https://github.com/AcademyHeroes/projectplanner-backend")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("swagger", app, document);
    const configService = app.get(config_1.ConfigService);
    await app.listen(configService.get("PORT") || 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map