"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const prisma_module_1 = require("./prisma/prisma.module");
const course_module_1 = require("./course/course.module");
const scheduler_module_1 = require("./scheduler/scheduler.module");
const data_ingestion_module_1 = require("./data-ingestion/data-ingestion.module");
const fiscal_year_module_1 = require("./fiscal-year/fiscal-year.module");
const trainer_module_1 = require("./trainer/trainer.module");
const calendar_module_1 = require("./calendar/calendar.module");
const notifications_module_1 = require("./notifications/notifications.module");
const mailer_1 = require("@nestjs-modules/mailer");
const ejs_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/ejs.adapter");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            prisma_module_1.PrismaModule,
            course_module_1.CourseModule,
            scheduler_module_1.SchedulerModule,
            data_ingestion_module_1.DataIngestionModule,
            fiscal_year_module_1.FiscalYearModule,
            trainer_module_1.TrainerModule,
            calendar_module_1.CalendarModule,
            notifications_module_1.NotificationsModule,
            mailer_1.MailerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    transport: configService.get("SMTP_CONNECTION_STRING"),
                    defaults: {
                        from: '"nest-modules" <modules@nestjs.com>',
                    },
                    template: {
                        dir: __dirname + "/templates",
                        adapter: new ejs_adapter_1.EjsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                }),
            }),
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map