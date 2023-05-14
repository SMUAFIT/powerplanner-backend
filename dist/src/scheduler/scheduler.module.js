"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerModule = void 0;
const common_1 = require("@nestjs/common");
const scheduler_service_1 = require("./scheduler.service");
const scheduler_controller_1 = require("./scheduler.controller");
const data_ingestion_module_1 = require("../data-ingestion/data-ingestion.module");
const course_module_1 = require("../course/course.module");
const fiscal_year_module_1 = require("../fiscal-year/fiscal-year.module");
const axios_1 = require("@nestjs/axios");
const scheduler_helper_1 = require("./scheduler.helper");
const trainer_module_1 = require("../trainer/trainer.module");
const calendar_module_1 = require("../calendar/calendar.module");
let SchedulerModule = class SchedulerModule {
};
SchedulerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            data_ingestion_module_1.DataIngestionModule,
            course_module_1.CourseModule,
            fiscal_year_module_1.FiscalYearModule,
            axios_1.HttpModule,
            trainer_module_1.TrainerModule,
            calendar_module_1.CalendarModule,
        ],
        controllers: [scheduler_controller_1.SchedulerController],
        providers: [scheduler_service_1.SchedulerService, scheduler_helper_1.SchedulerHelper],
    })
], SchedulerModule);
exports.SchedulerModule = SchedulerModule;
//# sourceMappingURL=scheduler.module.js.map