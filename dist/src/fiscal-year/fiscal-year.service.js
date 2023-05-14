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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiscalYearService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FiscalYearService = class FiscalYearService {
    constructor(prism) {
        this.prism = prism;
    }
    async patchFiscalYear(params) {
        const { where, data } = params;
        return this.prism.fiscalYear.update({
            data: data,
            where: where,
        });
    }
    async getFiscalYear(params) {
        const { where } = params;
        return this.prism.fiscalYear.findUnique({
            where: where,
        });
    }
    async getBlackoutDatesClashes(dates, blackoutDates) {
        const dateSet = new Set(dates.map((date) => new Date(date).toISOString().split("T")[0]));
        const clashes = new Map();
        for (const key in blackoutDates) {
            for (const date of blackoutDates[key]) {
                const day = new Date(date).toISOString().split("T")[0];
                if (dateSet.has(day)) {
                    if (clashes.has(key)) {
                        clashes.get(key).push(date);
                    }
                    else {
                        clashes.set(key, new Array(date));
                    }
                }
            }
        }
        return clashes;
    }
};
FiscalYearService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FiscalYearService);
exports.FiscalYearService = FiscalYearService;
//# sourceMappingURL=fiscal-year.service.js.map