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
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const exceljs_1 = require("exceljs");
const course_service_1 = require("../course/course.service");
const data_ingestion_service_1 = require("../data-ingestion/data-ingestion.service");
const fiscal_year_service_1 = require("../fiscal-year/fiscal-year.service");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const scheduler_helper_1 = require("./scheduler.helper");
const prisma_service_1 = require("../prisma/prisma.service");
const trainer_service_1 = require("../trainer/trainer.service");
const calendar_service_1 = require("../calendar/calendar.service");
let SchedulerService = class SchedulerService {
    constructor(prisma, dataIngestionService, courseService, configService, httpService, fiscalYearService, helper, trainerService, calendarService) {
        this.prisma = prisma;
        this.dataIngestionService = dataIngestionService;
        this.courseService = courseService;
        this.configService = configService;
        this.httpService = httpService;
        this.fiscalYearService = fiscalYearService;
        this.helper = helper;
        this.trainerService = trainerService;
        this.calendarService = calendarService;
        this.availabilities = {};
        this.failures = [];
        this.warnings = [];
    }
    async scheduleNew(file, formData) {
        const parsedData = this.dataIngestionService
            .parseSchedulingExcel(file, formData.fiscalYear)
            .then(async ([courseInfoRowObjects, courseInfoValidationObjects, manualAdditionRowObjects, manualValidationObjects,]) => {
            if (courseInfoValidationObjects.size > 0 ||
                manualValidationObjects.size > 0) {
                return { courseInfoValidationObjects, manualValidationObjects };
            }
            [this.yearOne, this.yearTwo] = formData.fiscalYear
                .split("-")
                .map(Number);
            const manyProgrammes = this.helper.constructManyProgramme(courseInfoRowObjects);
            await this.courseService.createManyProgrammes(manyProgrammes);
            const manyCourses = this.helper.constructManyCourses(courseInfoRowObjects);
            await this.courseService.createManyCourses(manyCourses);
            const [manyCourseConfigs, coursesToGenerate, multiModuleToGenerate] = this.helper.constructManyCourseConfigs(courseInfoRowObjects, formData.fiscalYear);
            await this.courseService.createManyCourseConfigs(manyCourseConfigs);
            const fyWhere = { fy: formData.fiscalYear };
            const blackoutPeriods = formData.blackoutPeriods === undefined
                ? {}
                : this.helper.parseBlackoutDates(formData.blackoutPeriods);
            const decreasedManpowerPeriods = formData.decreasedManpowerPeriods === undefined
                ? {}
                : this.helper.parseLowManpowerDates(formData.decreasedManpowerPeriods);
            const updateFyData = this.helper.constructFyData(Number(formData.maxCourseRunsPerDay), blackoutPeriods, decreasedManpowerPeriods);
            await this.fiscalYearService.patchFiscalYear({
                where: fyWhere,
                data: updateFyData,
            });
            this.initCalendar(Number(formData.maxCourseRunsPerDay), blackoutPeriods, decreasedManpowerPeriods);
            this.availabilities = {};
            this.failures = [];
            this.warnings = [];
            await this.fixManualAdditionCourses(manyCourseConfigs, manualAdditionRowObjects);
            await this.generateMultiModuleSchedule(multiModuleToGenerate);
            const [firstPriorityCourses, secondPriorityCourses,] = this.helper.splitCoursesByPriority(coursesToGenerate);
            await this.generateSchedule(firstPriorityCourses);
            await this.generateSchedule(secondPriorityCourses);
            return {
                failures: this.failures,
                warnings: this.warnings,
            };
        });
        return parsedData;
    }
    async generateMultiModuleSchedule(programmes) {
        const courseRuns = [];
        const courseSegments = [];
        const assignments = [];
        for (const programme of programmes) {
            const numModules = programme.length;
            const numRuns = programme[0].runs_per_year;
            let numModulesPerMonth;
            let numMonthsPerRun = Math.floor(12 / numRuns) + 2;
            if (numModules <= numMonthsPerRun) {
                numModulesPerMonth = 1;
            }
            else {
                numModulesPerMonth = 2;
            }
            numMonthsPerRun = Math.ceil(numModules / numModulesPerMonth);
            const monthOverlap = numRuns > 1
                ? Math.max(Math.ceil((numRuns * numMonthsPerRun - 12) / (numRuns - 1)), -1)
                : 0;
            for (let r = 0; r < numRuns; r++) {
                let month = (3 + r * numMonthsPerRun - r * monthOverlap) % 12;
                for (const course of programme) {
                    let year = Math.floor(month) < 3 ? this.yearTwo : this.yearOne;
                    const avoidMonthStart = course.avoid_month_start, avoidMonthEnd = course.avoid_month_end;
                    const numDays = course.days_per_run;
                    const daysToAvoid = course.days_to_avoid.map((day) => Number(day - 1));
                    const trainers = course.trainers;
                    let prefWeeks = this.getPrefWeeks(year, Math.floor(month), avoidMonthStart, avoidMonthEnd);
                    if (numModulesPerMonth == 2) {
                        const midIndex = Math.ceil(prefWeeks.length / 2);
                        if (Math.floor(month) == month) {
                            prefWeeks = prefWeeks.slice(0, midIndex);
                        }
                        else {
                            prefWeeks = prefWeeks.slice(midIndex);
                        }
                    }
                    let dates = [];
                    if (5 - daysToAvoid.length < numDays) {
                        const failure = {
                            config: course,
                            reasons: [
                                "Too many days to avoid for given days per run (Days To Avoid & Days / Run config)",
                            ],
                        };
                        this.failures.push(failure);
                        continue;
                    }
                    let bestWeek = this.findBestWeekOfMonth(prefWeeks, year, Math.floor(month));
                    let bestDayToStart = this.findBestDayToStart(numDays, daysToAvoid, year, Math.floor(month), bestWeek, trainers, true);
                    if (bestDayToStart === undefined) {
                        const { found, yy, mm, ww, dd } = this.seekForward(Math.floor(month), bestWeek, numDays, daysToAvoid, trainers, new Map(), true);
                        if (found) {
                            (year = yy), (month = mm), (bestWeek = ww), (bestDayToStart = dd);
                        }
                        else {
                            const failure = {
                                config: course,
                                reasons: [`Unable to find fitting schedule for run ${r + 1}`],
                            };
                            this.failures.push(failure);
                            continue;
                        }
                    }
                    dates = this.helper.generateDatesFromWeek(year, Math.floor(month), bestWeek, bestDayToStart, numDays);
                    dates.forEach((date) => {
                        this.updateTrainerAvailabilities(date, trainers, course, true);
                        this.adjustCourseSlotsForDate(date, -1);
                    });
                    courseRuns.push(this.helper.constructCourseRun(course.course_name, course.fy, r + 1));
                    courseSegments.push(this.helper.constructCourseSegment(course.course_name, course.fy, r + 1, 1, dates));
                    for (const trainer in trainers) {
                        assignments.push(this.helper.constructAssignment(course.course_name, course.fy, r + 1, 1, trainer));
                    }
                    month = (month + 1 / numModulesPerMonth) % 12;
                }
            }
        }
        await this.courseService.createManyCourseRuns(courseRuns);
        await this.courseService.createManyCourseSegments(courseSegments);
        await this.courseService.createManyAssignments(assignments);
    }
    async manualAdd(file, formData) {
        const [parsedData] = await this.dataIngestionService.parseManualAddExcel(file, formData.fiscalYear);
        const [y1, y2] = formData.fiscalYear.split("-").map(Number);
        this.yearOne = y1;
        this.yearTwo = y2;
        const fyWhere = { fy: formData.fiscalYear };
        const fy = await this.fiscalYearService.getFiscalYear({ where: fyWhere });
        const blackoutPeriods = JSON.parse(JSON.stringify(fy.blackout_dates));
        const lowManpowerPeriods = JSON.parse(JSON.stringify(fy.low_manpower_dates));
        const dayLimit = fy.day_limit;
        const blackoutDates = [];
        for (const period_name in blackoutPeriods) {
            const dates = blackoutPeriods[period_name];
            for (const date of dates) {
                blackoutDates.push(new Date(date).getTime());
            }
        }
        this.availabilities = {};
        this.failures = [];
        this.warnings = [];
        await this.populateAvailabilities(formData.fiscalYear);
        const courseSegments = [];
        const assignments = [];
        const courseRuns = [];
        const segmentsByRunByCourse = new Map();
        rowLoop: for (const row of parsedData) {
            const courseName = row.get("course_name").toString();
            const courseConfigWhere = {
                course_name: courseName,
                fy: fy.fy,
            };
            const courseConfig = await this.courseService.getCourseConfig(courseConfigWhere);
            const trainers = courseConfig.trainers;
            const daysPerRun = courseConfig.days_per_run;
            const segmentsForRow = [];
            if (!segmentsByRunByCourse.has(courseName)) {
                segmentsByRunByCourse.set(courseName, []);
            }
            if (row.has("start_date")) {
                const startDate = new Date(row.get("start_date").toString());
                const segmentDates = [];
                for (let d = 0; d < daysPerRun; d++) {
                    const nextDate = new Date(startDate);
                    nextDate.setDate(startDate.getDate() + d);
                    segmentDates.push(nextDate);
                    if (!this.updateTrainerAvailabilities(nextDate, trainers, courseConfig, false))
                        continue rowLoop;
                }
                segmentsForRow.push(segmentDates);
            }
            else if (row.has("dates")) {
                const rawDates = row
                    .get("dates")
                    .toString()
                    .split(",")
                    .map((dateString) => new Date(dateString));
                let segmentDates = [];
                for (const date of rawDates) {
                    if (segmentDates.length === 0) {
                        segmentDates.push(date);
                    }
                    else {
                        const dayAfterPrevDate = new Date(segmentDates.at(-1));
                        dayAfterPrevDate.setDate(dayAfterPrevDate.getDate() + 1);
                        if (dayAfterPrevDate.toDateString() === date.toDateString()) {
                            segmentDates.push(date);
                        }
                        else {
                            segmentsForRow.push(segmentDates);
                            segmentDates = [date];
                        }
                    }
                    if (!this.updateTrainerAvailabilities(date, trainers, courseConfig, false))
                        continue rowLoop;
                }
                if (segmentDates.length !== 0) {
                    segmentsForRow.push(segmentDates);
                }
            }
            segmentsByRunByCourse.get(courseName).push(segmentsForRow);
        }
        for (const [course, runs] of segmentsByRunByCourse) {
            runs.sort((a, b) => {
                return a[0][0].getTime() - b[0][0].getTime();
            });
            const courseConfigWhere = {
                course_name: course,
                fy: fy.fy,
            };
            const courseConfig = await this.courseService.getCourseConfig(courseConfigWhere);
            const runsPerYear = courseConfig.runs_per_year;
            const daysPerRun = courseConfig.days_per_run;
            const prevCourseRuns = await this.courseService.getCourseRunsOfFyAndCourse(fy.fy, course);
            let runCounter = prevCourseRuns.length + 1;
            runLoop: for (const [, run] of runs.entries()) {
                const tempCourseSegments = [];
                const tempAssignments = [];
                const warningReasons = new Set();
                let dayCount = 0;
                if (runCounter > runsPerYear) {
                    warningReasons.add("Number of runs provided do not match the number of runs for this course (Runs / FY config)");
                }
                for (const [s, segment] of run.entries()) {
                    tempCourseSegments.push(this.helper.constructCourseSegment(course, courseConfig.fy, runCounter, s + 1, segment));
                    for (const trainer in courseConfig.trainers) {
                        tempAssignments.push(this.helper.constructAssignment(course, courseConfig.fy, runCounter, s + 1, trainer));
                    }
                    for (const date of segment) {
                        const coursesOnDate = await this.calendarService.getCoursesOnDate(date);
                        const dayCap = this.helper.determineDayLimit(lowManpowerPeriods, date, dayLimit);
                        if (blackoutDates.includes(date.getTime())) {
                            warningReasons.add("Course scheduled on a blackout date: " + date.toDateString());
                        }
                        else if (coursesOnDate.length + 1 > dayCap) {
                            warningReasons.add("Max number of courses per day exceeded for " +
                                date.toDateString());
                        }
                        dayCount += 1;
                    }
                }
                if (dayCount != daysPerRun) {
                    warningReasons.add("Number of dates provided does not match the number of days for this course (Days / Run config)");
                }
                const tempRun = this.helper.constructCourseRun(course, courseConfig.fy, runCounter);
                if (warningReasons.size > 0) {
                    this.warnings.push({
                        reasons: Array.from(warningReasons),
                        config: courseConfig,
                        itemsOnHold: {
                            courseRun: tempRun,
                            courseSegments: tempCourseSegments,
                            assignments: tempAssignments,
                        },
                    });
                }
                else {
                    courseRuns.push(tempRun);
                    courseSegments.push(...tempCourseSegments);
                    assignments.push(...tempAssignments);
                }
                runCounter += 1;
            }
        }
        await this.courseService.createManyCourseRuns(courseRuns);
        await this.courseService.createManyCourseSegments(courseSegments);
        await this.courseService.createManyAssignments(assignments);
        return {
            failures: this.failures,
            warnings: this.warnings,
        };
    }
    async fixManualAdditionCourses(manyCourseConfigs, manualAdditionRowObjects) {
        const courseSegments = [];
        const assignments = [];
        const courseRuns = [];
        const segmentsByRunByCourse = new Map();
        rowLoop: for (const row of manualAdditionRowObjects) {
            const courseName = row.get("course_name").toString();
            const courseConfig = manyCourseConfigs.find((conf) => conf.course_name == courseName);
            const trainers = courseConfig.trainers;
            const daysPerRun = courseConfig.days_per_run;
            const segmentsForRow = [];
            if (!segmentsByRunByCourse.has(courseName)) {
                segmentsByRunByCourse.set(courseName, []);
            }
            if (row.has("start_date")) {
                const startDate = new Date(row.get("start_date").toString());
                const segmentDates = [];
                for (let d = 0; d < daysPerRun; d++) {
                    const nextDate = new Date(startDate);
                    nextDate.setDate(startDate.getDate() + d);
                    segmentDates.push(nextDate);
                    if (!this.updateTrainerAvailabilities(nextDate, trainers, courseConfig, false))
                        continue rowLoop;
                }
                segmentsForRow.push(segmentDates);
            }
            else if (row.has("dates")) {
                const rawDates = row
                    .get("dates")
                    .toString()
                    .split(",")
                    .map((dateString) => new Date(dateString));
                let segmentDates = [];
                for (const date of rawDates) {
                    if (segmentDates.length === 0) {
                        segmentDates.push(date);
                    }
                    else {
                        const dayAfterPrevDate = new Date(segmentDates.at(-1));
                        dayAfterPrevDate.setDate(dayAfterPrevDate.getDate() + 1);
                        if (dayAfterPrevDate.toDateString() === date.toDateString()) {
                            segmentDates.push(date);
                        }
                        else {
                            segmentsForRow.push(segmentDates);
                            segmentDates = [date];
                        }
                    }
                    if (!this.updateTrainerAvailabilities(date, trainers, courseConfig, false))
                        continue rowLoop;
                }
                if (segmentDates.length !== 0) {
                    segmentsForRow.push(segmentDates);
                }
            }
            segmentsByRunByCourse.get(courseName).push(segmentsForRow);
        }
        segmentsByRunByCourse.forEach((runs, course) => {
            runs.sort((a, b) => {
                return a[0][0].getTime() - b[0][0].getTime();
            });
            const courseConfig = manyCourseConfigs.find((conf) => conf.course_name == course);
            const runsPerYear = courseConfig.runs_per_year;
            const daysPerRun = courseConfig.days_per_run;
            runLoop: for (const [r, run] of runs.entries()) {
                const tempCourseSegments = [];
                const tempAssignments = [];
                const warningReasons = new Set();
                let dayCount = 0;
                if (r >= runsPerYear || runs.length != runsPerYear) {
                    warningReasons.add("Number of runs provided do not match the number of runs for this course (Runs / FY config)");
                }
                for (const [s, segment] of run.entries()) {
                    tempCourseSegments.push(this.helper.constructCourseSegment(course, courseConfig.fy, r + 1, s + 1, segment));
                    for (const trainer in courseConfig.trainers) {
                        tempAssignments.push(this.helper.constructAssignment(course, courseConfig.fy, r + 1, s + 1, trainer));
                    }
                    for (const date of segment) {
                        const adjustResult = this.adjustCourseSlotsForDate(date, -1);
                        if (adjustResult === "FAILURE") {
                            warningReasons.add("Course scheduled on a blackout date: " + date.toDateString());
                        }
                        else if (adjustResult === "WARNING") {
                            warningReasons.add("Max number of courses per day exceeded for " +
                                date.toDateString());
                        }
                        dayCount += 1;
                    }
                }
                if (dayCount != daysPerRun) {
                    warningReasons.add("Number of dates provided does not match the number of days for this course (Days / Run config)");
                }
                const tempRun = this.helper.constructCourseRun(course, courseConfig.fy, r + 1);
                if (warningReasons.size > 0) {
                    this.warnings.push({
                        reasons: Array.from(warningReasons),
                        config: courseConfig,
                        itemsOnHold: {
                            courseRun: tempRun,
                            courseSegments: tempCourseSegments,
                            assignments: tempAssignments,
                        },
                    });
                }
                else {
                    courseRuns.push(tempRun);
                    courseSegments.push(...tempCourseSegments);
                    assignments.push(...tempAssignments);
                }
            }
        });
        await this.courseService.createManyCourseRuns(courseRuns);
        await this.courseService.createManyCourseSegments(courseSegments);
        await this.courseService.createManyAssignments(assignments);
    }
    async generateSchedule(courses) {
        const courseRuns = [];
        const courseSegments = [];
        const assignments = [];
        const monthlyAvailableSlots = this.getMonthlyAvailableSlots();
        for (const course of courses) {
            const numRuns = course.runs_per_year, numDays = course.days_per_run;
            const avoidMonthStart = course.avoid_month_start, avoidMonthEnd = course.avoid_month_end;
            const runInterval = Math.floor(12 / numRuns);
            const daysToAvoid = course.days_to_avoid.map((day) => Number(day - 1));
            const trainers = course.trainers;
            const runs = [];
            const startOfRuns = new Map();
            if (numRuns <= 12) {
                let bestMonthToStart;
                const bestMonthBasedOnPrevFy = await this.getBestMonthBasedOnLastRunInPrevFy(this.yearOne, course.course_name, runInterval);
                if (bestMonthBasedOnPrevFy === null) {
                    bestMonthToStart = this.findBestMonthToStart(monthlyAvailableSlots, runInterval, numRuns, avoidMonthStart, avoidMonthEnd);
                }
                else {
                    bestMonthToStart = bestMonthBasedOnPrevFy;
                }
                for (let r = 0; r < numRuns; r++) {
                    let month = (r * runInterval + bestMonthToStart) % 12;
                    let year = month < 3 ? this.yearTwo : this.yearOne;
                    const prefWeeks = this.getPrefWeeks(year, month, avoidMonthStart, avoidMonthEnd);
                    let dates = [];
                    if (numDays <= 5) {
                        if (5 - daysToAvoid.length < numDays) {
                            const failure = {
                                config: course,
                                reasons: [
                                    "Too many days to avoid for given days per run (Days To Avoid & Days / Run config)",
                                ],
                            };
                            this.failures.push(failure);
                            continue;
                        }
                        let bestWeek = this.findBestWeekOfMonth(prefWeeks, year, month);
                        let bestDayToStart = this.findBestDayToStart(numDays, daysToAvoid, year, month, bestWeek, trainers, true);
                        if (bestDayToStart === undefined) {
                            const { found, yy, mm, ww, dd } = this.seekForward(month, bestWeek, numDays, daysToAvoid, trainers, startOfRuns, true);
                            if (found) {
                                (year = yy),
                                    (month = mm),
                                    (bestWeek = ww),
                                    (bestDayToStart = dd);
                            }
                            else {
                                const failure = {
                                    config: course,
                                    reasons: ["Unable to find fitting schedule"],
                                };
                                this.failures.push(failure);
                                continue;
                            }
                        }
                        startOfRuns.set([year, month, bestWeek], true);
                        dates = this.helper.generateDatesFromWeek(year, month, bestWeek, bestDayToStart, numDays);
                        dates.forEach((date) => {
                            this.updateTrainerAvailabilities(date, trainers, course, true);
                            this.adjustCourseSlotsForDate(date, -1);
                            monthlyAvailableSlots[month] -= 1;
                        });
                    }
                    else {
                        let bestWeeks = this.findBestConsecutiveWeeks(prefWeeks, year, month, numDays, true, trainers);
                        if (bestWeeks === undefined) {
                            const { found, yy, mm, wws } = this.seekForwardConsecutiveWeeks(month, prefWeeks, numDays, startOfRuns, true, trainers);
                            if (found) {
                                (bestWeeks = wws), (year = yy), (month = mm);
                            }
                            else {
                                const failure = {
                                    config: course,
                                    reasons: ["Unable to find fitting schedule"],
                                };
                                this.failures.push(failure);
                                continue;
                            }
                        }
                        startOfRuns.set([year, month, bestWeeks.at(0)], true);
                        dates = this.helper.generateDatesFromWeek(year, month, bestWeeks.at(0), 0, numDays);
                        dates.forEach((date) => {
                            this.updateTrainerAvailabilities(date, trainers, course, true);
                            this.adjustCourseSlotsForDate(date, -1);
                            monthlyAvailableSlots[month] -= 1;
                        });
                    }
                    runs.push(dates);
                }
            }
            else {
                const runsPerMonth = Math.ceil(numRuns / 12);
                let runsLeft = numRuns;
                for (let month = 0; month <= 11; month++) {
                    const numWeeksBetweenRuns = Math.floor((4 - runsPerMonth) / runsPerMonth);
                    const year = month < 3 ? this.yearTwo : this.yearOne;
                    const prefWeeks = this.getPrefWeeks(year, month, avoidMonthStart, avoidMonthEnd);
                    const bestWeeks = this.findBestNonConsecutiveWeeks(prefWeeks, year, month, runsPerMonth, numWeeksBetweenRuns);
                    for (const week of bestWeeks) {
                        if (startOfRuns.has([year, month, week]) || runsLeft == 0) {
                            continue;
                        }
                        const bestDayToStart = this.findBestDayToStart(numDays, daysToAvoid, year, month, week, trainers, true);
                        if (bestDayToStart === undefined) {
                            continue;
                        }
                        startOfRuns.set([year, month, week], true);
                        const dates = this.helper.generateDatesFromWeek(year, month, week, bestDayToStart, numDays);
                        dates.forEach((date) => {
                            this.updateTrainerAvailabilities(date, trainers, course, true);
                            this.adjustCourseSlotsForDate(date, -1);
                            monthlyAvailableSlots[month] -= 1;
                        });
                        runs.push(dates);
                        runsLeft--;
                    }
                }
                for (let r = 0; r < runsLeft; r++) {
                    const monthInterval = Math.abs(Math.floor((12 - runsLeft) / runsLeft));
                    const month = Math.abs((r * (monthInterval + 1)) % 12);
                    const { found, yy, mm, ww, dd } = this.seekForward(month, 0, numDays, daysToAvoid, trainers, startOfRuns, true);
                    let dates;
                    if (found) {
                        startOfRuns.set([yy, mm, ww], true);
                        dates = this.helper.generateDatesFromWeek(yy, mm, ww, dd, numDays);
                    }
                    else {
                        const failure = {
                            config: course,
                            reasons: ["Unable to find fitting schedule"],
                        };
                        this.failures.push(failure);
                        continue;
                    }
                    dates.forEach((date) => {
                        this.updateTrainerAvailabilities(date, trainers, course, true);
                        this.adjustCourseSlotsForDate(date, -1);
                        monthlyAvailableSlots[month] -= 1;
                    });
                    runs.push(dates);
                }
            }
            runs.sort((a, b) => {
                return a[0].getTime() - b[0].getTime();
            });
            runs.forEach((runDates, r) => {
                courseRuns.push(this.helper.constructCourseRun(course.course_name, course.fy, r + 1));
                courseSegments.push(this.helper.constructCourseSegment(course.course_name, course.fy, r + 1, 1, runDates));
                for (const trainer in trainers) {
                    assignments.push(this.helper.constructAssignment(course.course_name, course.fy, r + 1, 1, trainer));
                }
            });
        }
        await this.courseService.createManyCourseRuns(courseRuns);
        await this.courseService.createManyCourseSegments(courseSegments);
        await this.courseService.createManyAssignments(assignments);
    }
    async confirmItemsOnHold(dto) {
        const errors = [];
        for (const heldItems of dto.approvedRuns) {
            const { courseRun, courseSegments, assignments } = heldItems;
            try {
                await this.courseService.createCourseRun(courseRun);
                await this.courseService.createManyCourseSegments(courseSegments);
                await this.courseService.createManyAssignments(assignments);
            }
            catch (e) {
                errors.push({
                    message: e.message,
                    name: e.name,
                    items: heldItems,
                });
            }
        }
        return { errors: errors };
    }
    getMonthlyAvailableSlots() {
        const monthlyAvailableSlots = Array(12);
        for (let m = 0; m <= 2; m++) {
            let slotsLeft = 0;
            for (const w in this.calendar[this.yearTwo][m]["weeks"]) {
                const weekArr = this.calendar[this.yearTwo][m]["weeks"][w];
                slotsLeft += this.helper.sumArray(weekArr);
            }
            monthlyAvailableSlots[m] = slotsLeft;
        }
        for (let m = 3; m <= 11; m++) {
            let slotsLeft = 0;
            for (const w in this.calendar[this.yearOne][m]["weeks"]) {
                const weekArr = this.calendar[this.yearOne][m]["weeks"][w];
                slotsLeft += this.helper.sumArray(weekArr);
            }
            monthlyAvailableSlots[m] = slotsLeft;
        }
        const ratio = Math.max(...monthlyAvailableSlots) / 36;
        for (let i = 0; i < monthlyAvailableSlots.length; i++) {
            monthlyAvailableSlots[i] = Math.round(monthlyAvailableSlots[i] / ratio);
        }
        return monthlyAvailableSlots;
    }
    async createErrorWorkbook(file, courseInfoValidationObjects, manualValidationObjects) {
        const workbook = new exceljs_1.Workbook();
        const res = workbook.xlsx.load(file.buffer).then(async () => {
            const courseInfoSheet = workbook.getWorksheet("Course Information");
            const courseInfoErrorCell = courseInfoSheet.getRow(1).getCell(16);
            courseInfoErrorCell.value = "Error(s)";
            for (const [key, value] of courseInfoValidationObjects.entries()) {
                const row = courseInfoSheet.getRow(key);
                row.getCell(16).value = value;
            }
            const manualSheet = workbook.getWorksheet("Manual Addition");
            const manualErrorCell = manualSheet.getRow(1).getCell(6);
            manualErrorCell.value = "Error(s)";
            for (const [key, value] of manualValidationObjects.entries()) {
                const row = manualSheet.getRow(key);
                row.getCell(6).value = value;
            }
            return workbook;
        });
        return res;
    }
    async getPublicHolidays(dto) {
        const timeMin = dto.startYear + "-04-01T00:00:00Z";
        const timeMax = parseInt(dto.startYear) + 1 + "-03-31T00:00:00Z";
        const key = this.configService.get("GOOGLE_CALENDAR_KEY");
        const url = "https://www.googleapis.com/calendar/v3/calendars/en.singapore%23holiday%40group.v.calendar.google.com/events?timeMax=" +
            timeMax +
            "&key=" +
            key +
            "&timeMin=" +
            timeMin;
        const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
        const map = new Map();
        const nonHolidays = [
            "Easter Sunday",
            "Easter Saturday",
            "Children's Day",
            "Teachers' Day",
        ];
        for (let i = 0; i < data.items.length; i++) {
            const holiday = data.items[i];
            const name = holiday.summary;
            const date = holiday.start.date;
            const dateFormat = new Date(date);
            const day = dateFormat.getDay();
            if (day == 0) {
                dateFormat.setDate(dateFormat.getDate() + 1);
            }
            if (!nonHolidays.includes(name)) {
                map.set(name, dateFormat.toISOString());
            }
        }
        return Object.fromEntries(map);
    }
    async getTrainerFilterOptions(dto) {
        try {
            const options_dict = {};
            const trainer_courses = await this.prisma.courseConfig.findMany({
                where: {
                    fy: dto.fy,
                    CourseRun: {
                        some: {
                            CourseSegment: {
                                some: {
                                    Assignment: {
                                        some: {
                                            user_name: dto.trainerName,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                select: {
                    Course: true,
                },
            });
            const programme_names = trainer_courses.map((course) => course["Course"]["programme_name"]);
            const unique_programme_names = [...new Set(programme_names)];
            const course_names = trainer_courses.map((programme) => programme["Course"]["course_name"]);
            options_dict["programmes"] = unique_programme_names;
            options_dict["courses"] = course_names;
            let trainer_status = Object.values(client_1.Status);
            trainer_status = trainer_status.filter((element) => element != "GENERATED" && element != "REVIEWED");
            options_dict["status"] = trainer_status;
            const all_mod = Object.values(client_1.DeliveryMode);
            options_dict["mode of delivery"] = all_mod;
            return options_dict;
        }
        catch (e) {
            return e;
        }
    }
    async getPMFilterOptions(dto) {
        try {
            const options_dict = {};
            const all_programmes = await this.prisma.courseConfig.findMany({
                where: {
                    fy: dto.fy,
                },
                select: {
                    Course: true,
                },
            });
            const programme_names = all_programmes.map((programme) => programme["Course"]["programme_name"]);
            options_dict["programmes"] = programme_names;
            const all_courses = await this.prisma.courseConfig.findMany({
                where: {
                    fy: dto.fy,
                },
            });
            const course_names = all_courses.map((course) => course["course_name"]);
            options_dict["courses"] = course_names;
            const all_assignments = await this.prisma.courseConfig.findMany({
                where: {
                    fy: dto.fy,
                },
                select: {
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
            });
            const nameSet = new Set();
            for (let i = 0; i < all_assignments.length; i++) {
                const courseRun = all_assignments[i]["CourseRun"];
                for (let j = 0; j < courseRun.length; j++) {
                    const courseSegment = courseRun[j]["CourseSegment"];
                    for (let k = 0; k < courseSegment.length; k++) {
                        const assignment = courseSegment[k]["Assignment"];
                        for (let l = 0; l < assignment.length; l++) {
                            const username = assignment[l]["user_name"];
                            nameSet.add(username);
                        }
                    }
                }
            }
            const trainer_names = Array.from(nameSet);
            options_dict["trainers"] = trainer_names;
            const all_status = Object.values(client_1.Status);
            options_dict["status"] = all_status;
            const all_mod = Object.values(client_1.DeliveryMode);
            options_dict["mode of delivery"] = all_mod;
            return options_dict;
        }
        catch (e) {
            return e;
        }
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
                        CourseRun: {
                            select: {
                                CourseSegment: {
                                    where: courseSegmentQuery,
                                    select: {
                                        course_name: true,
                                        dates: true,
                                        status: true,
                                        Assignment: true,
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
                        const trainerAssignmentStatuses = new Map();
                        const trainerDeclineReason = new Map();
                        let trainerExists = trainers.length == 0 ? true : false;
                        for (let i = 0; i < assignment.length; i++) {
                            if (trainers.includes(assignment[i].user_name)) {
                                trainerExists = true;
                            }
                            trainerAssignmentStatuses.set(assignment[i].user_name, assignment[i].assignment_status);
                            if (assignment[i].assignment_status == client_1.Status.DECLINED) {
                                trainerDeclineReason.set(assignment[i].user_name, assignment[i].decline_reason);
                            }
                        }
                        if (!trainerExists) {
                            continue;
                        }
                        const output = {
                            programme_name: response[c].programme_name,
                            course_code: response[c].course_code,
                            delivery_mode: response[c].delivery_mode,
                            start_time: new Date(response[c].CourseConfig[r].start_time)
                                .toISOString()
                                .slice(11, 16),
                            end_time: new Date(response[c].CourseConfig[r].end_time)
                                .toISOString()
                                .slice(11, 16),
                            run: assignment[0].run,
                            segment: assignment[0].segment,
                            course_name: courseSegment[a].course_name,
                            fy: assignment[0].fy,
                            trainersAssignmentResponse: Object.fromEntries(trainerAssignmentStatuses),
                            trainerDeclineReason: Object.fromEntries(trainerDeclineReason),
                            status: courseSegment[a].status,
                            dates: courseSegment[a].dates,
                        };
                        courseRuns.push(output);
                    }
                }
            }
        }
        return courseRuns;
    }
    async getBlackoutDates(body) {
        const fyInfo = await this.fiscalYearService.getFiscalYear({
            where: { fy: body.fy },
        });
        const blackoutDates = JSON.parse(JSON.stringify(fyInfo.blackout_dates));
        return this.formatBlackoutDates(blackoutDates);
    }
    formatCalendarResults(courseRuns) {
        const events = [];
        for (let i = 0; i < courseRuns.length; i++) {
            const currentObj = courseRuns[i];
            const originalStartDate = currentObj.dates[0];
            const originalEndDate = currentObj.dates.at(-1);
            const start = originalStartDate.toISOString().split("T")[0];
            const end = originalEndDate.toISOString().split("T")[0];
            const objStartTime = currentObj.start_time;
            const objEndTime = currentObj.end_time;
            const timed = objStartTime != "00:00" || objEndTime != "00:00";
            const startTime = timed ? false : objStartTime;
            const endTime = timed ? false : objEndTime;
            events.push({
                programme_name: currentObj.programme_name,
                course_code: currentObj.course_code,
                delivery_mode: currentObj.delivery_mode,
                name: currentObj.course_name,
                start: start,
                end: end,
                timed: false,
                status: currentObj.status,
                additionalEventInfo: {
                    user_name: currentObj.user_name,
                    segment: currentObj.segment,
                    fy: currentObj.fy,
                    run: currentObj.run,
                    start_time: startTime,
                    end_time: endTime,
                    blackout_date: false,
                    trainersAssignmentResponse: currentObj.trainersAssignmentResponse,
                    trainerDeclineReason: currentObj.trainerDeclineReason,
                },
            });
        }
        return events;
    }
    formatBlackoutDates(blackoutDates) {
        const events = [];
        for (const [name, dates] of Object.entries(blackoutDates)) {
            dates.sort(function (a, b) {
                return new Date(a).getTime() - new Date(b).getTime();
            });
            const startDate = new Date(dates[0]).toISOString().split("T")[0];
            const endDate = new Date(dates.at(-1))
                .toISOString()
                .split("T")[0];
            events.push({
                name: name,
                start: startDate,
                end: endDate,
                timed: false,
                color: "black",
                additionalEventInfo: {
                    blackout_date: true,
                },
            });
        }
        return events;
    }
    initCalendar(maxCourseRunsPerDay, blackoutDates, lowManpowerDates) {
        const calendar = {};
        let firstYear = {};
        let secondYear = {};
        firstYear = this.helper.initYear(this.yearOne, maxCourseRunsPerDay, 3, 11);
        secondYear = this.helper.initYear(this.yearTwo, maxCourseRunsPerDay, 0, 2);
        calendar[this.yearOne] = firstYear;
        calendar[this.yearTwo] = secondYear;
        this.calendar = calendar;
        this.setLowManpowerDates(lowManpowerDates);
        this.setBlackoutDates(blackoutDates);
        return calendar;
    }
    setBlackoutDates(blackoutDates) {
        for (const period_name in blackoutDates) {
            const dates = blackoutDates[period_name];
            for (const date of dates) {
                this.setCourseSlotsForDate(date, null);
            }
        }
    }
    adjustCourseSlotsForDate(date, increment) {
        const yy = date.getFullYear();
        const mm = date.getMonth();
        const dayOfWeek = date.getDay();
        if (yy in this.calendar && dayOfWeek != 0 && dayOfWeek != 6) {
            const week = this.helper.getWeekFromDate(date);
            if (this.calendar[yy][mm]["weeks"][week][dayOfWeek - 1] === null) {
                return "FAILURE";
            }
            if (this.calendar[yy][mm]["weeks"][week][dayOfWeek - 1] <= 0) {
                this.calendar[yy][mm]["weeks"][week][dayOfWeek - 1] -= 100;
                return "WARNING";
            }
            this.calendar[yy][mm]["weeks"][week][dayOfWeek - 1] += increment;
        }
        return "";
    }
    setLowManpowerDates(lowManpowerDates) {
        for (const period_name in lowManpowerDates) {
            const period = lowManpowerDates[period_name];
            const dayLimit = period.day_limit;
            const dates = period.dates;
            for (const date of dates) {
                this.setCourseSlotsForDate(date, dayLimit);
            }
        }
    }
    setCourseSlotsForDate(date, slots) {
        const yy = date.getFullYear();
        const mm = date.getMonth();
        const dayOfWeek = date.getDay();
        if (yy in this.calendar && dayOfWeek != 0 && dayOfWeek != 6) {
            const week = this.helper.getWeekFromDate(date);
            this.calendar[yy][mm]["weeks"][week][dayOfWeek - 1] = slots;
        }
    }
    findBestMonthToStart(monthlyAvailableSlots, runInterval, numRuns, avoidMonthStart, avoidMonthEnd) {
        let maxCourseSlotsLeftForMonth = Number.MIN_SAFE_INTEGER;
        let bestMonthToStart;
        for (let i = 0; i < runInterval; i++) {
            let courseSlotsLeftForMonths = 0;
            for (let j = 0; j < numRuns; j++) {
                const month = i + j * runInterval;
                const year = month < 3 ? this.yearTwo : this.yearOne;
                courseSlotsLeftForMonths += Number(monthlyAvailableSlots[month]);
                const lastWeek = Object.keys(this.calendar[year][month]["weeks"]).length - 1;
                const allowedWeeks = this.getPrefWeeks(year, month, avoidMonthStart, avoidMonthEnd);
                for (let sw = 0; sw < allowedWeeks.at(0); sw++) {
                    courseSlotsLeftForMonths -= Number(this.helper.sumArray(this.calendar[year][month]["weeks"][sw]));
                }
                for (let ew = lastWeek; ew > allowedWeeks.at(-1); ew--) {
                    courseSlotsLeftForMonths -= Number(this.helper.sumArray(this.calendar[year][month]["weeks"][ew]));
                }
            }
            if (courseSlotsLeftForMonths > maxCourseSlotsLeftForMonth) {
                maxCourseSlotsLeftForMonth = courseSlotsLeftForMonths;
                bestMonthToStart = i;
            }
        }
        return bestMonthToStart;
    }
    getPrefWeeks(year, month, avoidStart, avoidEnd) {
        let startWeek;
        let endWeek;
        const lastWeek = Object.keys(this.calendar[year][month]["weeks"]).length - 1;
        if (avoidStart) {
            const monthStartDay = new Date(year, month, 1).getDay();
            startWeek = monthStartDay > 2 ? 2 : 1;
        }
        else {
            startWeek = 0;
        }
        if (avoidEnd) {
            const monthEndDay = new Date(year, month + 1, 0).getDay();
            endWeek = monthEndDay < 4 ? lastWeek - 2 : lastWeek - 1;
        }
        else {
            endWeek = lastWeek;
        }
        return Array.from({ length: endWeek - startWeek + 1 }, (_, idx) => idx + startWeek);
    }
    findBestWeekOfMonth(prefWeeks, year, month) {
        let maxSlotsLeftForWeek = Number.MIN_SAFE_INTEGER;
        let bestWeek;
        for (let w = 0; w < prefWeeks.length; w++) {
            const slotsLeftForWeek = this.helper.sumArray(this.calendar[year][month]["weeks"][prefWeeks[w]]);
            if (slotsLeftForWeek > maxSlotsLeftForWeek) {
                maxSlotsLeftForWeek = slotsLeftForWeek;
                bestWeek = prefWeeks[w];
            }
        }
        return bestWeek;
    }
    findBestNonConsecutiveWeeks(prefWeeks, year, month, runsPerMonth, numWeeksBetweenRuns) {
        let maxSlotsLeftForWeeks = Number.MIN_SAFE_INTEGER;
        let bestWeeks;
        for (let w = 0; w < prefWeeks.length; w++) {
            const weeks = [];
            let slotsLeftForWeeks = 0;
            for (let r = 0; r < runsPerMonth; r++) {
                const week = w + r * (numWeeksBetweenRuns + 1);
                if (week <= prefWeeks.at(-1)) {
                    weeks.push(week);
                    const slotsLeftForWeek = this.helper.sumArray(this.calendar[year][month]["weeks"][prefWeeks[week]]);
                    slotsLeftForWeeks += slotsLeftForWeek;
                }
            }
            if (slotsLeftForWeeks > maxSlotsLeftForWeeks) {
                maxSlotsLeftForWeeks = slotsLeftForWeeks;
                bestWeeks = weeks;
            }
        }
        return bestWeeks;
    }
    findBestConsecutiveWeeks(prefWeeks, year, month, numDays, useStrict, trainers) {
        const numWeeks = Math.ceil((numDays - 6) / 7) + 1;
        let maxSlotsLeftForWeeks = Number.MIN_SAFE_INTEGER;
        let bestWeeks;
        for (let sw = 0; sw < prefWeeks.length - numWeeks; sw++) {
            const weeks = Array.from({ length: numWeeks }, (_, idx) => idx + prefWeeks[sw]);
            let slotsLeftForWeeks = 0;
            let isAvailable = true;
            for (const week of weeks) {
                const currWeek = this.calendar[year][month]["weeks"][week];
                for (const day of currWeek) {
                    if ((useStrict && (day === null || day <= 0)) ||
                        (!useStrict && day === null) ||
                        !this.areTrainersAvailable(this.helper.generateDateFromWeek(year, month, week, day), trainers)) {
                        isAvailable = false;
                        break;
                    }
                }
                const slotsLeftForWeek = this.helper.sumArray(currWeek);
                slotsLeftForWeeks += slotsLeftForWeek;
            }
            if (slotsLeftForWeeks > maxSlotsLeftForWeeks && isAvailable) {
                maxSlotsLeftForWeeks = slotsLeftForWeeks;
                bestWeeks = weeks;
            }
        }
        return bestWeeks;
    }
    findBestDayToStart(numDays, daysToAvoid, year, month, week, trainers, useStrict) {
        let maxSlotsLeftForDays = Number.MIN_SAFE_INTEGER;
        let bestDayToStart;
        const numOptions = 5 - numDays + 1;
        candidateLoop: for (let d = 0; d < numOptions; d++) {
            let slotsLeftForDays = 0;
            for (let f = d; f < d + numDays; f++) {
                const date = this.helper.generateDateFromWeek(year, month, week, f);
                const selectedDay = this.calendar[year][month]["weeks"][week][f];
                if (daysToAvoid.includes(f) ||
                    !this.areTrainersAvailable(date, trainers) ||
                    (useStrict && (selectedDay === null || selectedDay <= 0)) ||
                    (!useStrict && selectedDay === null)) {
                    continue candidateLoop;
                }
                else {
                    slotsLeftForDays += this.calendar[year][month]["weeks"][week][f];
                }
            }
            if (slotsLeftForDays > maxSlotsLeftForDays) {
                maxSlotsLeftForDays = slotsLeftForDays;
                bestDayToStart = d;
            }
        }
        return bestDayToStart;
    }
    seekForwardConsecutiveWeeks(month, prefWeeks, numDays, startOfRuns, useStrict, trainers) {
        const startMonth = month;
        let year;
        let bestWeeks;
        do {
            month = (month + 1) % 12;
            year = month < 3 ? this.yearTwo : this.yearOne;
            const weeks = this.findBestConsecutiveWeeks(prefWeeks, year, month, numDays, useStrict, trainers);
            if (weeks !== undefined && !startOfRuns.has([year, month, weeks.at(0)])) {
                break;
            }
        } while (!(month === startMonth));
        return {
            found: bestWeeks === undefined ? false : true,
            yy: year,
            mm: month,
            wws: bestWeeks,
        };
    }
    seekForward(month, week, numDays, daysToAvoid, trainers, startOfRuns, useStrict) {
        const startMonth = month, startWeek = week;
        let bestDayToStart;
        let year;
        do {
            week++;
            year = month < 3 ? this.yearTwo : this.yearOne;
            const lastWeekOfMonth = Object.keys(this.calendar[year][month]["weeks"]).length - 1;
            if (week > lastWeekOfMonth) {
                month = (month + 1) % 12;
                week = 0;
                continue;
            }
            if (startOfRuns.has([year, month, week])) {
                continue;
            }
            bestDayToStart = this.findBestDayToStart(numDays, daysToAvoid, year, month, week, trainers, useStrict);
            if (bestDayToStart !== undefined) {
                break;
            }
        } while (!(month === startMonth && week === startWeek));
        return {
            found: bestDayToStart === undefined ? false : true,
            yy: year,
            mm: month,
            ww: week,
            dd: bestDayToStart,
        };
    }
    areTrainersAvailable(date, trainers) {
        for (const trainer in trainers) {
            if (trainer in this.availabilities &&
                this.availabilities[trainer].includes(date.getTime())) {
                return false;
            }
        }
        return true;
    }
    updateTrainerAvailabilities(date, trainers, config, skipCheck) {
        if (skipCheck || this.areTrainersAvailable(date, trainers)) {
            for (const trainer in trainers) {
                if (trainer in this.availabilities) {
                    this.availabilities[trainer].push(date.getTime());
                }
                else {
                    this.availabilities[trainer] = [date.getTime()];
                }
            }
            return true;
        }
        else {
            this.failures.push({
                config: config,
                reasons: ["Trainer Availability Conflict on " + date.toDateString()],
            });
            return false;
        }
    }
    async populateAvailabilities(fy) {
        const res = await this.trainerService.getAssignmentsTrainersSegmentDatesOfFy(fy);
        for (const assignment of res) {
            if (!(assignment.user_name in this.availabilities)) {
                this.availabilities[assignment.user_name] = [];
            }
            for (const date of assignment.CourseSegment.dates) {
                this.availabilities[assignment.user_name].push(new Date(date).getTime());
            }
        }
    }
    async getBestMonthBasedOnLastRunInPrevFy(currentYearOne, courseName, runInterval) {
        const prevFy = Number(currentYearOne) - 1 + "-" + currentYearOne;
        const prevFyLastDate = new Date(currentYearOne, 2, 31);
        const courseSegments = await this.courseService.getCourseSegmentsOfFyAndCourse(prevFy, courseName);
        if (courseSegments.length === 0) {
            return null;
        }
        else {
            courseSegments.sort(function (segment1, segment2) {
                return segment2.dates[0].getTime() - segment1.dates[0].getTime();
            });
            const latestDate = courseSegments[0].dates[0];
            const nextFyFirstRunDate = new Date(latestDate);
            nextFyFirstRunDate.setMonth(latestDate.getMonth() + runInterval);
            if (nextFyFirstRunDate.getDate() != latestDate.getDate()) {
                nextFyFirstRunDate.setDate(0);
            }
            return nextFyFirstRunDate < prevFyLastDate
                ? 3
                : nextFyFirstRunDate.getMonth();
        }
    }
};
SchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        data_ingestion_service_1.DataIngestionService,
        course_service_1.CourseService,
        config_1.ConfigService,
        axios_1.HttpService,
        fiscal_year_service_1.FiscalYearService,
        scheduler_helper_1.SchedulerHelper,
        trainer_service_1.TrainerService,
        calendar_service_1.CalendarService])
], SchedulerService);
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=scheduler.service.js.map