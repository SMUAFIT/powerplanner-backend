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
exports.CourseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dto_1 = require("../scheduler/dto");
const course_service_1 = require("./course.service");
const dto_2 = require("./dto");
const guard_1 = require("../auth/guard");
const get_assignment_dto_1 = require("./dto/get-assignment.dto");
let CourseController = class CourseController {
    constructor(courseService) {
        this.courseService = courseService;
    }
    getCourses(body) {
        return this.courseService.getCourses(body);
    }
    filterCourses(body) {
        return this.courseService.filterCourses(body);
    }
    getCourseDetails(body) {
        return this.courseService.getCourseDetails(body);
    }
    deleteCourse(body) {
        return this.courseService.removeCourse(body);
    }
    getProgrammes() {
        return this.courseService.getProgrammes();
    }
    getProgramme(body) {
        return this.courseService.getProgramme(body);
    }
    updateCourseSegmentStatus(body) {
        return this.courseService.updateCourseSegmentStatus(body);
    }
    updateAssignmentStatus(body) {
        return this.courseService.updateAssignmentStatus(body);
    }
    editCourseRun(body) {
        return this.courseService.editScheduledCourseRun(body);
    }
    async exportCourseSegment(res, dto) {
        try {
            const courseSegments = await this.courseService.exportCourseSegment(dto);
            const workbook = this.courseService.exportCourseSegmentToExcel(courseSegments);
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=" + "coursesegments.xlsx");
            return workbook.xlsx.write(res).then(function () {
                res.status(200).end();
            });
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    deleteCourseRun(body) {
        return this.courseService.removeScheduledCourseRun(body);
    }
    createNewCourse(body) {
        return this.courseService.createNewCourse(body);
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.fyDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "getCourses", null);
__decorate([
    (0, common_1.Post)("filter"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.CourseFilterDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "filterCourses", null);
__decorate([
    (0, common_1.Post)("details"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.GetCourseConfigDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "getCourseDetails", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.GetCourseConfigDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Get)("programmes"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "getProgrammes", null);
__decorate([
    (0, common_1.Post)("programme"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.GetProgrammeDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "getProgramme", null);
__decorate([
    (0, common_1.Put)("segment/status"),
    __param(0, (0, common_1.Body)(new common_1.ParseArrayPipe({ items: dto_2.UpdateCourseSegmentDto, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "updateCourseSegmentStatus", null);
__decorate([
    (0, common_1.Put)("assignment/status"),
    __param(0, (0, common_1.Body)(new common_1.ParseArrayPipe({ items: get_assignment_dto_1.AssignmentDto, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "updateAssignmentStatus", null);
__decorate([
    (0, common_1.Patch)("run"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.EditCourseSegmentDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "editCourseRun", null);
__decorate([
    (0, common_1.Post)("segment/export"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.FilterDto]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "exportCourseSegment", null);
__decorate([
    (0, common_1.Delete)("run/delete"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.CourseRunDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "deleteCourseRun", null);
__decorate([
    (0, common_1.Post)("new"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.CreateNewCourseDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "createNewCourse", null);
CourseController = __decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("course"),
    (0, swagger_1.ApiTags)("Course & Programmes"),
    __metadata("design:paramtypes", [course_service_1.CourseService])
], CourseController);
exports.CourseController = CourseController;
//# sourceMappingURL=course.controller.js.map