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
exports.TrainerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TrainerService = class TrainerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTrainerClashes(courseSegmentsOnSameDays, fy, courseName, segment, run, newTrainerList) {
        const clashes = new Map();
        const trainerSet = new Set(newTrainerList);
        for (const [date, courseSegments] of courseSegmentsOnSameDays.entries()) {
            for (const courseSegment of courseSegments) {
                const trainerArr = await this.getAssignmentTrainersByCourseSegments(fy, courseSegment.course_name, courseSegment.segment, courseSegment.run);
                for (const trainer of trainerArr) {
                    if (trainerSet.has(trainer.user_name)) {
                        if (clashes.has(trainer.user_name)) {
                            clashes.get(trainer.user_name).push(new Date(date));
                        }
                        else {
                            clashes.set(trainer.user_name, [new Date(date)]);
                        }
                    }
                }
            }
        }
        return clashes;
    }
    async getAssignmentsTrainersSegmentDatesOfFy(fy) {
        return this.prisma.assignment.findMany({
            where: {
                fy: fy,
            },
            select: {
                user_name: true,
                CourseSegment: {
                    select: {
                        dates: true,
                    },
                },
            },
        });
    }
    async getAssignmentTrainersByCourseSegments(fy, course_name, segment, run) {
        const resp = await this.prisma.assignment.findMany({
            where: {
                fy: fy,
                course_name: course_name,
                segment: segment,
                run: run,
            },
            select: {
                user_name: true,
            },
        });
        return resp;
    }
};
TrainerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainerService);
exports.TrainerService = TrainerService;
//# sourceMappingURL=trainer.service.js.map