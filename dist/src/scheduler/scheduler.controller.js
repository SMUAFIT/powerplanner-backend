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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerController = void 0;
const common_1 = require("@nestjs/common");
const scheduler_service_1 = require("./scheduler.service");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const dto_1 = require("./dto");
const add_items_on_hold_dto_1 = require("./dto/add-items-on-hold.dto");
const guard_1 = require("../auth/guard");
let SchedulerController = class SchedulerController {
    constructor(schedulerService) {
        this.schedulerService = schedulerService;
    }
    async scheduleNew(res, body, file) {
        const path = require("path");
        const validExtName = /xls|xlsx/.test(path.extname(file.originalname).toLowerCase());
        if (validExtName) {
            this.schedulerService.scheduleNew(file, body).then(async (response) => {
                if ("courseInfoValidationObjects" in response) {
                    const workbook = this.schedulerService.createErrorWorkbook(file, response.courseInfoValidationObjects, response.manualValidationObjects);
                    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    res.setHeader("Content-Disposition", "attachment; filename=" + "input_errors.xlsx");
                    await (await workbook).xlsx.write(res);
                    res.status(201).end();
                }
                else {
                    res.status(200).send(response);
                }
            });
        }
        else {
            return res.status(400).send({ message: "Invalid file format, " });
        }
    }
    getPublicHolidays(body) {
        return this.schedulerService.getPublicHolidays(body);
    }
    getTrainerFilterOptions(body) {
        return this.schedulerService.getTrainerFilterOptions(body);
    }
    getPMFilterOptions(body) {
        return this.schedulerService.getPMFilterOptions(body);
    }
    async getCalendarFilterResults(dto) {
        const filterResults = await this.schedulerService.getFilterResults(dto);
        return this.schedulerService.formatCalendarResults(filterResults);
    }
    async getBlackoutDates(body) {
        return this.schedulerService.getBlackoutDates(body);
    }
    getFilterResults(dto) {
        return this.schedulerService.getFilterResults(dto);
    }
    manualAdd(body, file) {
        return this.schedulerService.manualAdd(file, body);
    }
    async approveWarnings(res, dto) {
        const response = await this.schedulerService.confirmItemsOnHold(dto);
        if (response.errors.length === 0) {
            res.status(200).send("Successfully created items on hold");
        }
        else {
            res.status(500).send(response);
        }
    }
};
__decorate([
    (0, common_1.Post)("new"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.ScheduleDto, Object]),
    __metadata("design:returntype", Promise)
], SchedulerController.prototype, "scheduleNew", null);
__decorate([
    (0, common_1.Post)("holidays"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.HolidayDto]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getPublicHolidays", null);
__decorate([
    (0, common_1.Post)("/filterOptions/trainer"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.trainerFilterDto]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getTrainerFilterOptions", null);
__decorate([
    (0, common_1.Post)("/filterOptions/pm"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.fyDto]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getPMFilterOptions", null);
__decorate([
    (0, common_1.Post)("/calendar/filter"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FilterDto]),
    __metadata("design:returntype", Promise)
], SchedulerController.prototype, "getCalendarFilterResults", null);
__decorate([
    (0, common_1.Post)("/calendar/blackoutdates"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.fyDto]),
    __metadata("design:returntype", Promise)
], SchedulerController.prototype, "getBlackoutDates", null);
__decorate([
    (0, common_1.Post)("/filter"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FilterDto]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getFilterResults", null);
__decorate([
    (0, common_1.Post)("/manualAddition"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ManualDto, Object]),
    __metadata("design:returntype", Object)
], SchedulerController.prototype, "manualAdd", null);
__decorate([
    (0, common_1.Post)("/approveWarnings"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_items_on_hold_dto_1.AddItemsOnHoldDto]),
    __metadata("design:returntype", Promise)
], SchedulerController.prototype, "approveWarnings", null);
SchedulerController = __decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("scheduler"),
    (0, swagger_1.ApiTags)("Scheduler"),
    __metadata("design:paramtypes", [scheduler_service_1.SchedulerService])
], SchedulerController);
exports.SchedulerController = SchedulerController;
//# sourceMappingURL=scheduler.controller.js.map