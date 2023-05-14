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
exports.CourseService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const exceljs_1 = require("exceljs");
const fiscal_year_service_1 = require("../fiscal-year/fiscal-year.service");
const notifications_service_1 = require("../notifications/notifications.service");
const trainer_service_1 = require("../trainer/trainer.service");
const prisma_service_1 = require("../prisma/prisma.service");
let CourseService = class CourseService {
    constructor(prisma, fiscalYearService, trainerService, notificationsService) {
        this.prisma = prisma;
        this.fiscalYearService = fiscalYearService;
        this.trainerService = trainerService;
        this.notificationsService = notificationsService;
    }
    async getCourses(fy) {
        const response = await this.prisma.courseConfig.findMany({
            where: {
                fy: fy.fy,
            },
            select: {
                days_per_run: true,
                trainers: true,
                course_fees: true,
                Course: true,
            },
        });
        const output = [];
        for (let i = 0; i < response.length; i++) {
            const course = response[i].Course;
            const course_fees = response[i].course_fees.toLocaleString("en-SG");
            const days = response[i].days_per_run;
            const trainers = response[i].trainers;
            const trainerArr = [];
            for (const trainer in trainers) {
                trainerArr.push(trainer);
            }
            output.push(Object.assign(Object.assign({}, course), { course_fees,
                days, trainers: trainerArr }));
        }
        return output;
    }
    async getCourseDetails(courseConfigDto) {
        const response = await this.prisma.courseConfig.findFirst({
            where: {
                course_name: courseConfigDto.course_name,
                fy: courseConfigDto.fy,
            },
            include: {
                Course: true,
            },
        });
        const dta = response.days_to_avoid;
        const converted_days = [];
        if (dta.length != 0) {
            for (let i = 0; i < dta.length; i++) {
                converted_days.push(this.dayOfWeekAsString(dta[i]));
            }
        }
        response.days_to_avoid = converted_days;
        const scheduledRuns = await this.prisma.courseRun.count({
            where: {
                course_name: courseConfigDto.course_name,
                fy: courseConfigDto.fy,
            },
        });
        response["runs_scheduled"] = scheduledRuns;
        return response;
    }
    async removeCourse(courseConfig) {
        try {
            return this.prisma.courseConfig.delete({
                where: {
                    course_name_fy: {
                        course_name: courseConfig.course_name,
                        fy: courseConfig.fy,
                    },
                },
            });
        }
        catch (e) {
            return e;
        }
    }
    async editScheduledCourseRun(editCourseSegmentDto) {
        try {
            const bypass = editCourseSegmentDto.bypass;
            const newTrainerList = editCourseSegmentDto.newTrainerList;
            const dates = editCourseSegmentDto.dates;
            const courseName = editCourseSegmentDto.course_name;
            const fy = editCourseSegmentDto.fy;
            const segment = editCourseSegmentDto.segment;
            const run = editCourseSegmentDto.run;
            const status = editCourseSegmentDto.status;
            const originalSegment = await this.prisma.courseSegment.findUnique({
                where: {
                    segment_course_name_fy_run: {
                        fy: fy,
                        course_name: courseName,
                        segment: segment,
                        run: run,
                    },
                },
            });
            const originalSegmentDates = originalSegment.dates;
            const allDates = this.getAllDatesBetween(dates);
            if (!bypass) {
                const fyInfo = await this.fiscalYearService.getFiscalYear({
                    where: { fy: fy },
                });
                const allCourseSegmentsInFy = await this.getCourseSegmentsOfFy(editCourseSegmentDto.fy);
                const courseSegmentsOnSameDays = this.getCourseSegmentsOnSameDays(courseName, run, segment, allDates, allCourseSegmentsInFy);
                const blackoutDateClashes = await this.fiscalYearService.getBlackoutDatesClashes(allDates, JSON.parse(JSON.stringify(fyInfo.blackout_dates)));
                const lowManpowerDatesClashes = this.getLowManpowerDateClashes(courseSegmentsOnSameDays, JSON.parse(JSON.stringify(fyInfo.low_manpower_dates)));
                const dayLimitClashes = this.getDayLimitClashes(courseSegmentsOnSameDays, JSON.parse(JSON.stringify(fyInfo.day_limit)));
                const trainerClashes = await this.trainerService.getTrainerClashes(courseSegmentsOnSameDays, fy, courseName, segment, run, newTrainerList);
                const sameCourseClashes = await this.getCourseRunClashes(courseSegmentsOnSameDays, courseName);
                if (blackoutDateClashes.size > 0 ||
                    lowManpowerDatesClashes.size > 0 ||
                    dayLimitClashes.length > 0 ||
                    trainerClashes.size > 0 ||
                    sameCourseClashes.length > 0) {
                    return {
                        blackoutDateClashes: Object.fromEntries(blackoutDateClashes),
                        lowManpowerDatesClashes: Object.fromEntries(lowManpowerDatesClashes),
                        dayLimitClashes: dayLimitClashes,
                        trainerClashes: Object.fromEntries(trainerClashes),
                        sameCourseClashes: sameCourseClashes,
                    };
                }
            }
            delete editCourseSegmentDto.bypass;
            delete editCourseSegmentDto.newTrainerList;
            const oldTrainers = await this.trainerService.getAssignmentTrainersByCourseSegments(fy, courseName, segment, run);
            const oldTrainerList = oldTrainers.map((trainer) => trainer.user_name);
            const trainersToAdd = newTrainerList.filter((trainer) => !oldTrainerList.includes(trainer));
            const trainersToRemove = oldTrainerList.filter((trainer) => !newTrainerList.includes(trainer));
            const trainerStatus = status == client_1.Status.GENERATED || status == client_1.Status.REVIEWED
                ? status
                : client_1.Status.PENDING;
            for (const trainer of trainersToAdd) {
                await this.createAssignment({
                    user_name: trainer,
                    segment: segment,
                    course_name: courseName,
                    fy: fy,
                    run: run,
                    assignment_status: trainerStatus,
                    decline_reason: undefined,
                    createdAt: undefined,
                    updatedAt: undefined,
                });
            }
            for (const trainer of trainersToRemove) {
                await this.prisma.assignment.delete({
                    where: {
                        user_name_segment_course_name_fy_run: {
                            segment: segment,
                            course_name: courseName,
                            fy: fy,
                            run: run,
                            user_name: trainer,
                        },
                    },
                });
            }
            let courseSegment = await this.prisma.courseSegment.update({
                where: {
                    segment_course_name_fy_run: {
                        segment: segment,
                        course_name: courseName,
                        fy: fy,
                        run: run,
                    },
                },
                data: {
                    dates: editCourseSegmentDto.dates.map((date) => new Date(date)),
                },
            });
            if ((originalSegmentDates.at(0).toISOString() != allDates.at(0) ||
                originalSegmentDates.at(-1).toISOString() != allDates.at(-1)) &&
                trainerStatus != client_1.Status.GENERATED &&
                trainerStatus != client_1.Status.REVIEWED) {
                const updatedCourseSegment = {
                    segment: segment,
                    run: run,
                    course_name: courseName,
                    fy: fy,
                    new_status: trainerStatus,
                };
                await this.updateCourseSegmentStatus([updatedCourseSegment]);
                courseSegment.status = trainerStatus;
            }
            else if (trainerStatus == client_1.Status.PENDING) {
                if (trainersToAdd.length > 0) {
                    await this.notificationsService.notifyNewlyAssignedTrainers(trainersToAdd, editCourseSegmentDto);
                    courseSegment = await this.prisma.courseSegment.update({
                        where: {
                            segment_course_name_fy_run: {
                                segment: segment,
                                course_name: courseName,
                                fy: fy,
                                run: run,
                            },
                        },
                        data: {
                            status: client_1.Status.PENDING,
                        },
                    });
                }
            }
            if (trainerStatus == client_1.Status.PENDING) {
                await this.notificationsService.notifyUnassignedTrainers(trainersToRemove, editCourseSegmentDto);
            }
            return courseSegment;
        }
        catch (e) {
            return e.message;
        }
    }
    getAllDatesBetween(dates) {
        dates.sort(function (a, b) {
            return new Date(a).getTime() - new Date(b).getTime();
        });
        const allDates = [];
        const startDate = new Date(dates[0]);
        const endDate = new Date(dates.at(-1));
        let currentDate = startDate;
        const addDays = function (days) {
            const date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        };
        while (currentDate <= endDate) {
            allDates.push(currentDate.toISOString());
            currentDate = addDays.call(currentDate, 1);
        }
        return allDates;
    }
    getCourseRunClashes(courseSegmentsOnSameDays, courseName) {
        const sameCourseRunClashes = [];
        for (const [date, courseSegments] of courseSegmentsOnSameDays) {
            for (const courseSegment of courseSegments) {
                if (courseSegment.course_name == courseName) {
                    sameCourseRunClashes.push(new Date(date));
                }
            }
        }
        return sameCourseRunClashes;
    }
    getLowManpowerDateClashes(courseSegmentsOnSameDays, lowManpowerDates) {
        const lowManpowerDateClashes = new Map();
        for (const [date, courseSegment] of courseSegmentsOnSameDays) {
            const numCourseSegments = courseSegment.length;
            for (const [key, value] of Object.entries(lowManpowerDates)) {
                const lmDates = new Set(value.dates);
                if (lmDates.has(date) && numCourseSegments >= value.day_limit) {
                    lowManpowerDateClashes.set(key, new Date(date));
                }
            }
        }
        return lowManpowerDateClashes;
    }
    getDayLimitClashes(courseSegmentsOnSameDays, day_limit) {
        const dayLimitClashes = [];
        for (const [date, courseSegment] of courseSegmentsOnSameDays) {
            const numCourseSegments = courseSegment.length;
            if (numCourseSegments >= day_limit) {
                dayLimitClashes.push(new Date(date));
            }
        }
        return dayLimitClashes;
    }
    getCourseSegmentsOnSameDays(course_name, run, segment, dates, allCourseSegmentsInFy) {
        const daysAffected = new Map();
        const datesSet = new Set(dates.map((date) => new Date(date).toISOString().split("T")[0]));
        for (let i = 0; i < allCourseSegmentsInFy.length; i++) {
            const courseSegment = allCourseSegmentsInFy[i];
            const courseSegmentDates = courseSegment.dates;
            for (let j = 0; j < courseSegmentDates.length; j++) {
                const courseSegmentDate = courseSegmentDates[j]
                    .toISOString()
                    .split("T")[0];
                if (datesSet.has(courseSegmentDate) &&
                    !this.arraysEqual([
                        courseSegment.course_name,
                        courseSegment.run,
                        courseSegment.segment,
                    ], [course_name, run, segment])) {
                    if (daysAffected.has(courseSegmentDate)) {
                        daysAffected.get(courseSegmentDate).push(courseSegment);
                    }
                    else {
                        daysAffected.set(courseSegmentDate, [courseSegment]);
                    }
                }
            }
        }
        return daysAffected;
    }
    async createCourse(course) {
        return this.prisma.course.upsert({
            where: {
                course_name: course.course_name,
            },
            create: {
                course_name: course.course_name,
                course_code: course.course_code,
                programme_name: course.programme_name,
                delivery_mode: course.delivery_mode,
            },
            update: {
                course_name: course.course_name,
                course_code: course.course_code,
                programme_name: course.programme_name,
                delivery_mode: course.delivery_mode,
            },
        });
    }
    async createCourseRun(courseRun) {
        try {
            return this.prisma.courseRun.create({
                data: courseRun,
            });
        }
        catch (e) {
            return e;
        }
    }
    async createManyCourses(coursesArr) {
        try {
            return this.prisma.course.createMany({
                data: coursesArr,
                skipDuplicates: true,
            });
        }
        catch (e) {
            return e;
        }
    }
    async getProgrammes() {
        return this.prisma.programme.findMany();
    }
    async getProgramme(body) {
        return this.prisma.programme.findUnique({
            where: { programme_name: body.programme_name },
        });
    }
    async createProgramme(programme) {
        try {
            return this.prisma.programme.create({
                data: programme,
            });
        }
        catch (e) {
            return e;
        }
    }
    async createManyProgrammes(programmeNameArr) {
        try {
            return this.prisma.programme.createMany({
                data: programmeNameArr,
                skipDuplicates: true,
            });
        }
        catch (e) {
            return e;
        }
    }
    async getCourseConfig(body) {
        return this.prisma.courseConfig.findUnique({
            where: {
                course_name_fy: {
                    course_name: body.course_name,
                    fy: body.fy,
                },
            },
        });
    }
    async getCourseConfigsOfFy(fy) {
        return this.prisma.courseConfig.findMany({
            where: {
                fy: fy,
            },
        });
    }
    async createManyCourseConfigs(courseConfigsArr) {
        try {
            return this.prisma.courseConfig.createMany({
                data: courseConfigsArr,
                skipDuplicates: true,
            });
        }
        catch (e) {
            return e;
        }
    }
    async createManyCourseRuns(courseRunsArr) {
        try {
            return this.prisma.courseRun.createMany({
                data: courseRunsArr,
                skipDuplicates: true,
            });
        }
        catch (e) {
            return e;
        }
    }
    async getCourseRunsOfFyAndCourse(fy, courseName) {
        return this.prisma.courseRun.findMany({
            where: {
                fy: fy,
                course_name: courseName,
            },
        });
    }
    async getCourseSegmentsOfFyAndCourse(fy, courseName) {
        return this.prisma.courseSegment.findMany({
            where: {
                fy: fy,
                course_name: courseName,
            },
        });
    }
    async getCourseSegmentsOfFy(fy) {
        return this.prisma.courseSegment.findMany({
            where: {
                fy: fy,
            },
        });
    }
    async createManyCourseSegments(courseSegmentsArr) {
        try {
            return this.prisma.courseSegment.createMany({
                data: courseSegmentsArr,
                skipDuplicates: true,
            });
        }
        catch (e) {
            throw e;
        }
    }
    async createAssignment(assignment) {
        try {
            return this.prisma.assignment.create({
                data: assignment,
            });
        }
        catch (e) {
            return e;
        }
    }
    async createManyAssignments(assignmentsArr) {
        try {
            return this.prisma.assignment.createMany({
                data: assignmentsArr,
                skipDuplicates: true,
            });
        }
        catch (e) {
            throw e;
        }
    }
    async updateCourseSegmentStatus(courseSegmentArr) {
        try {
            const resultsArray = [];
            for (let i = 0; i < courseSegmentArr.length; i++) {
                const updateCourseSegment = await this.prisma.courseSegment.update({
                    where: {
                        segment_course_name_fy_run: {
                            segment: courseSegmentArr[i].segment,
                            course_name: courseSegmentArr[i].course_name,
                            fy: courseSegmentArr[i].fy,
                            run: courseSegmentArr[i].run,
                        },
                    },
                    data: {
                        status: courseSegmentArr[i].new_status,
                    },
                });
                resultsArray.push(updateCourseSegment);
                let decline_reason = "";
                if (courseSegmentArr[i].new_status === "DECLINED") {
                    decline_reason = "Declined by PM";
                }
                await this.prisma.assignment.updateMany({
                    where: {
                        segment: courseSegmentArr[i].segment,
                        course_name: courseSegmentArr[i].course_name,
                        fy: courseSegmentArr[i].fy,
                        run: courseSegmentArr[i].run,
                    },
                    data: {
                        assignment_status: courseSegmentArr[i].new_status,
                        decline_reason: decline_reason,
                    },
                });
            }
            await this.notificationsService.notifyTrainersBySegments(resultsArray);
            return resultsArray;
        }
        catch (e) {
            return e;
        }
    }
    async updateAssignmentStatus(AssignmentArr) {
        try {
            const resultsArray = [];
            for (let i = 0; i < AssignmentArr.length; i++) {
                const updateAssignmentStatus = await this.prisma.assignment.update({
                    where: {
                        user_name_segment_course_name_fy_run: {
                            user_name: AssignmentArr[i].user_name,
                            segment: AssignmentArr[i].segment,
                            course_name: AssignmentArr[i].course_name,
                            fy: AssignmentArr[i].fy,
                            run: AssignmentArr[i].run,
                        },
                    },
                    data: {
                        assignment_status: AssignmentArr[i].new_status,
                        decline_reason: AssignmentArr[i].decline_reason,
                    },
                });
                resultsArray.push(updateAssignmentStatus);
                const allAssignmentStatus = await this.prisma.assignment.findMany({
                    where: {
                        segment: AssignmentArr[i].segment,
                        course_name: AssignmentArr[i].course_name,
                        fy: AssignmentArr[i].fy,
                        run: AssignmentArr[i].run,
                    },
                    select: {
                        assignment_status: true,
                    },
                });
                const assignmentStatusArray = allAssignmentStatus.map((assignment) => assignment.assignment_status);
                if (assignmentStatusArray.includes("DECLINED")) {
                    const updatedCourseSegmentStatus = await this.prisma.courseSegment.update({
                        where: {
                            segment_course_name_fy_run: {
                                segment: AssignmentArr[i].segment,
                                course_name: AssignmentArr[i].course_name,
                                fy: AssignmentArr[i].fy,
                                run: AssignmentArr[i].run,
                            },
                        },
                        data: {
                            status: "DECLINED",
                        },
                    });
                }
                const allEqual = assignmentStatusArray.every((val) => val === "ACCEPTED");
                if (allEqual) {
                    const updatedCourseSegmentStatus = await this.prisma.courseSegment.update({
                        where: {
                            segment_course_name_fy_run: {
                                segment: AssignmentArr[i].segment,
                                course_name: AssignmentArr[i].course_name,
                                fy: AssignmentArr[i].fy,
                                run: AssignmentArr[i].run,
                            },
                        },
                        data: {
                            status: "ACCEPTED",
                        },
                    });
                }
            }
            return resultsArray;
        }
        catch (e) {
            return e;
        }
    }
    async removeScheduledCourseRun(courseRun) {
        try {
            return this.prisma.courseRun.delete({
                where: {
                    run_course_name_fy: {
                        run: courseRun.run,
                        course_name: courseRun.course_name,
                        fy: courseRun.fy,
                    },
                },
            });
        }
        catch (e) {
            return e;
        }
    }
    async exportCourseSegment(dto) {
        const courseSegments = await this.getFilterResults(dto);
        if (dto.export_by_trainer) {
            return this.formatFilterResults(courseSegments);
        }
        return courseSegments;
    }
    formatFilterResults(courseSegments) {
        for (let i = 0; i < courseSegments.length; i++) {
            const re = /:V[0-9]$/;
            courseSegments[i].course_name = courseSegments[i].course_name.replace(re, "");
        }
        return courseSegments;
    }
    async createNewCourse(body) {
        const programme = await this.getProgramme({
            programme_name: body.programme_name,
        });
        if (programme == null) {
            await this.createProgramme({ programme_name: body.programme_name });
        }
        await this.createCourse({
            course_name: body.course_name,
            programme_name: body.programme_name,
            course_code: body.course_code,
            delivery_mode: body.delivery_mode,
        });
        const trainers = {};
        for (const trainer of body.trainers) {
            for (const [name, dates] of Object.entries(trainer)) {
                trainers[name] = dates;
            }
        }
        const courseConfig = await this.createManyCourseConfigs([
            {
                course_name: body.course_name,
                fy: body.fy,
                days_per_run: body.days_per_run,
                runs_per_year: body.runs_per_year,
                course_fees: body.course_fees,
                start_time: this.formatTime(body.start_time),
                end_time: this.formatTime(body.end_time),
                days_to_avoid: body.days_to_avoid,
                avoid_month_start: body.avoid_month_start,
                avoid_month_end: body.avoid_month_end,
                split: [],
                trainers: trainers,
                createdAt: undefined,
                updatedAt: undefined,
            },
        ]);
        return courseConfig;
    }
    async getFilterResults(dto) {
        const programme_name = dto.programme_name;
        const course_name = dto.course_name;
        const delivery_mode = dto.delivery_mode;
        const status = dto.status;
        const trainers = dto.trainers;
        const courseQuery = {};
        if (programme_name.length !== 0) {
            courseQuery["programme_name"] = { in: programme_name };
        }
        if (course_name.length !== 0) {
            courseQuery["course_name"] = { in: course_name };
        }
        if (delivery_mode.length !== 0) {
            courseQuery["delivery_mode"] = { in: delivery_mode };
        }
        const assignmentQuery = {};
        if (trainers.length !== 0) {
            assignmentQuery["user_name"] = { in: trainers };
        }
        const courseSegmentQuery = {
            fy: dto.fy,
        };
        if (status.length !== 0) {
            courseSegmentQuery["status"] = { in: status };
        }
        const response = await this.prisma.course.findMany({
            where: courseQuery,
            select: {
                course_code: true,
                programme_name: true,
                delivery_mode: true,
                CourseConfig: {
                    select: {
                        start_time: true,
                        end_time: true,
                        days_per_run: true,
                        runs_per_year: true,
                        course_fees: true,
                        days_to_avoid: true,
                        avoid_month_start: true,
                        avoid_month_end: true,
                        trainers: true,
                        CourseRun: {
                            select: {
                                CourseSegment: {
                                    where: courseSegmentQuery,
                                    select: {
                                        Assignment: {
                                            where: assignmentQuery,
                                        },
                                        course_name: true,
                                        dates: true,
                                        status: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const courseRuns = [];
        for (let c = 0; c < response.length; c++) {
            const courseConfig = response[c].CourseConfig;
            for (let r = 0; r < courseConfig.length; r++) {
                const courseRun = response[c].CourseConfig[r].CourseRun;
                for (let s = 0; s < courseRun.length; s++) {
                    const courseSegment = response[c].CourseConfig[r].CourseRun[s].CourseSegment;
                    for (let a = 0; a < courseSegment.length; a++) {
                        const assignment = courseSegment[a].Assignment;
                        if (assignment.length == 0) {
                            continue;
                        }
                        const output = Object.assign(Object.assign({ programme_name: response[c].programme_name, course_code: response[c].course_code, delivery_mode: response[c].delivery_mode, start_time: new Date(response[c].CourseConfig[r].start_time)
                                .toISOString()
                                .slice(11, 16), end_time: new Date(response[c].CourseConfig[r].end_time)
                                .toISOString()
                                .slice(11, 16), days_per_run: response[c].CourseConfig[r].days_per_run, runs_per_year: response[c].CourseConfig[r].runs_per_year, course_fees: response[c].CourseConfig[r].course_fees.toLocaleString("en-SG"), days_to_avoid: response[c].CourseConfig[r].days_to_avoid.join(", "), avoid_month_start: response[c].CourseConfig[r].avoid_month_start, avoid_month_end: response[c].CourseConfig[r].avoid_month_end, trainers: Object.keys(JSON.parse(JSON.stringify(response[c].CourseConfig[r].trainers))).join(", ") }, assignment[0]), { status: courseSegment[a].status, dates: courseSegment[a].dates });
                        courseRuns.push(output);
                    }
                }
            }
        }
        return courseRuns;
    }
    async filterCourses(dto) {
        const programme_name = dto.programme_name;
        const course_name = dto.course_name;
        const delivery_mode = dto.delivery_mode;
        const trainers = dto.trainers;
        const courseQuery = {};
        if (programme_name.length !== 0) {
            courseQuery["programme_name"] = { in: programme_name };
        }
        if (course_name.length !== 0) {
            courseQuery["course_name"] = { in: course_name };
        }
        if (delivery_mode.length !== 0) {
            courseQuery["delivery_mode"] = { in: delivery_mode };
        }
        const courseSegmentQuery = {
            fy: dto.fy,
        };
        const response = await this.prisma.course.findMany({
            where: courseQuery,
            select: {
                course_name: true,
                course_code: true,
                programme_name: true,
                delivery_mode: true,
                CourseConfig: {
                    where: courseSegmentQuery,
                    select: {
                        days_per_run: true,
                        course_fees: true,
                        createdAt: true,
                        CourseRun: {
                            select: {
                                CourseSegment: {
                                    select: {
                                        Assignment: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        console.log(response);
        const courses = [];
        for (let c = 0; c < response.length; c++) {
            let trainerExists = trainers.length == 0 ? true : false;
            const courseConfig = response[c].CourseConfig[0];
            const allTrainers = new Set();
            if (response[c].CourseConfig.length > 0) {
                const courseRun = courseConfig.CourseRun;
                for (let s = 0; s < courseRun.length; s++) {
                    const courseSegment = courseConfig.CourseRun[s].CourseSegment;
                    for (let a = 0; a < courseSegment.length; a++) {
                        const assignment = courseSegment[a].Assignment;
                        if (assignment.length == 0) {
                            continue;
                        }
                        for (let i = 0; i < assignment.length; i++) {
                            if (trainers.includes(assignment[i].user_name)) {
                                trainerExists = true;
                            }
                            allTrainers.add(assignment[i].user_name);
                        }
                    }
                }
            }
            if (!trainerExists) {
                continue;
            }
            if (response[c].CourseConfig.length != 0) {
                const output = {
                    programme_name: response[c].programme_name,
                    course_name: response[c].course_name,
                    course_code: response[c].course_code,
                    delivery_mode: response[c].delivery_mode,
                    course_fees: courseConfig.course_fees.toLocaleString("en-SG"),
                    days_per_run: courseConfig.days_per_run,
                    createdAt: courseConfig.createdAt,
                    trainers: Array.from(allTrainers).join(", "),
                };
                courses.push(output);
            }
        }
        return courses;
    }
    exportCourseSegmentToExcel(courseSegments) {
        const workbook = new exceljs_1.Workbook();
        const worksheet = workbook.addWorksheet("Course Segment");
        const columns = [
            { header: "FY", key: "fy", width: 10 },
            { header: "Programme Name", key: "programme_name", width: 30 },
            { header: "Course Name", key: "course_name", width: 25 },
            { header: "Start Date", key: "start_date", width: 10 },
            { header: "End Date", key: "end_date", width: 10 },
            { header: "Course Code", key: "course_code", width: 10 },
            { header: "Delivery Mode", key: "delivery_mode", width: 12 },
            { header: "Trainer(s)", key: "user_name", width: 15 },
            { header: "Run", key: "run", width: 5 },
            { header: "Session", key: "segment", width: 7 },
            { header: "Start Time", key: "start_time", width: 9 },
            { header: "End Time", key: "end_time", width: 8 },
            { header: "Status", key: "status", width: 10 },
            { header: "Days per Run", key: "days_per_run", width: 11 },
            { header: "Runs per Year", key: "runs_per_year", width: 11 },
            { header: "Course Fees", key: "course_fees", width: 10 },
            { header: "Days to Avoid", key: "days_to_avoid", width: 11 },
            { header: "Avoid Month Start", key: "avoid_month_start", width: 15 },
            { header: "Avoid Month End", key: "avoid_month_end", width: 14 },
            { header: "Trainers", key: "trainers", width: 8 },
        ];
        courseSegments.forEach((courseSegment) => {
            courseSegment["start_date"] = courseSegment.dates[0]
                .toISOString()
                .split("T")[0];
            courseSegment["end_date"] = courseSegment.dates
                .at(-1)
                .toISOString()
                .split("T")[0];
        });
        worksheet.columns = columns;
        [
            "A1",
            "B1",
            "C1",
            "D1",
            "E1",
            "F1",
            "G1",
            "H1",
            "I1",
            "J1",
            "K1",
            "L1",
            "M1",
            "N1",
            "O1",
            "P1",
            "Q1",
            "R1",
            "S1",
            "T1",
        ].map((cell) => {
            worksheet.getCell(cell).font = { bold: true, color: { argb: "FFFFFF" } };
            worksheet.getCell(cell).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ff203070" },
            };
        });
        worksheet.addRows(courseSegments);
        return workbook;
    }
    dayOfWeekAsString(dayIndex) {
        return ([
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ][dayIndex] || "");
    }
    arraysEqual(a, b) {
        if (a === b)
            return true;
        if (a == null || b == null)
            return false;
        if (a.length !== b.length)
            return false;
        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    }
    formatTime(timeString) {
        if (timeString == null) {
            return null;
        }
        const date = new Date();
        const [hours, minutes] = timeString.split(":");
        date.setHours(Number(hours));
        date.setMinutes(Number(minutes));
        return date;
    }
};
CourseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        fiscal_year_service_1.FiscalYearService,
        trainer_service_1.TrainerService,
        notifications_service_1.NotificationsService])
], CourseService);
exports.CourseService = CourseService;
//# sourceMappingURL=course.service.js.map