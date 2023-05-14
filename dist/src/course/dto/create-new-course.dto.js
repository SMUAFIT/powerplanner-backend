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
exports.CreateNewCourseDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateNewCourseDto {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateNewCourseDto.prototype, "programme_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateNewCourseDto.prototype, "course_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateNewCourseDto.prototype, "fy", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateNewCourseDto.prototype, "course_code", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.DeliveryMode),
    (0, swagger_1.ApiProperty)({
        enum: client_1.DeliveryMode,
    }),
    __metadata("design:type", String)
], CreateNewCourseDto.prototype, "delivery_mode", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateNewCourseDto.prototype, "days_per_run", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateNewCourseDto.prototype, "runs_per_year", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CreateNewCourseDto.prototype, "course_fees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateNewCourseDto.prototype, "start_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CreateNewCourseDto.prototype, "end_time", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], CreateNewCourseDto.prototype, "days_to_avoid", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], CreateNewCourseDto.prototype, "avoid_month_start", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], CreateNewCourseDto.prototype, "avoid_month_end", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], CreateNewCourseDto.prototype, "trainers", void 0);
exports.CreateNewCourseDto = CreateNewCourseDto;
//# sourceMappingURL=create-new-course.dto.js.map