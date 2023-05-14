"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerHelper = void 0;
const client_1 = require("@prisma/client");
class SchedulerHelper {
    splitCoursesByPriority(courses) {
        const firstPriorityCourses = [];
        const secondPriorityCourses = [];
        courses.forEach((course) => {
            if (course.days_to_avoid.length != 0 ||
                course.avoid_month_end ||
                course.avoid_month_start) {
                firstPriorityCourses.push(course);
            }
            else {
                secondPriorityCourses.push(course);
            }
        });
        return [firstPriorityCourses, secondPriorityCourses];
    }
    generateDatesFromWeek(year, month, bestWeek, bestDayToStart, numDays) {
        const startDate = this.generateDateFromWeek(year, month, bestWeek, bestDayToStart);
        const startDateOfMonth = startDate.getDate();
        const dates = [];
        for (let d = 0; d < numDays; d++) {
            const date = new Date(year, month, startDateOfMonth + d);
            dates.push(date);
        }
        return dates;
    }
    generateDateFromWeek(year, month, week, day) {
        const ww = week;
        const firstDayOfMonth = new Date(year, month, 1).getDay() - 1;
        const dayDiff = day - firstDayOfMonth;
        const startDateOfMonth = ww * 7 + dayDiff + 1;
        return new Date(year, month, startDateOfMonth);
    }
    constructManyProgramme(courseInfoRowObjects) {
        const arrProgrammes = [];
        for (const courseInfoRow of courseInfoRowObjects) {
            if (courseInfoRow.size != 0) {
                let programme_name;
                if (courseInfoRow.has("programme_name")) {
                    programme_name = courseInfoRow.get("programme_name").toString();
                }
                else {
                    programme_name = courseInfoRow.get("course_name").toString();
                }
                const programme = {
                    programme_name: programme_name,
                    createdAt: undefined,
                    updatedAt: undefined,
                };
                arrProgrammes.push(programme);
            }
        }
        return arrProgrammes;
    }
    constructManyCourses(courseInfoRowObjects) {
        const arrCourses = [];
        for (const courseInfoRow of courseInfoRowObjects) {
            if (courseInfoRow.size != 0) {
                let programme_name;
                if (courseInfoRow.has("programme_name")) {
                    programme_name = courseInfoRow.get("programme_name").toString();
                }
                else {
                    programme_name = courseInfoRow.get("course_name").toString();
                }
                const course = {
                    course_name: courseInfoRow.get("course_name").toString(),
                    programme_name: programme_name,
                    course_code: courseInfoRow.get("course_code").toString(),
                    delivery_mode: client_1.DeliveryMode[courseInfoRow.get("delivery_mode").toString().toUpperCase()],
                    createdAt: undefined,
                    updatedAt: undefined,
                };
                arrCourses.push(course);
            }
        }
        return arrCourses;
    }
    constructManyCourseConfigs(courseInfoRowObjects, fy) {
        const arrCourseConfigs = [];
        const coursesToGenerate = [];
        const multiModuleToGenerate = [];
        const tempHolder = new Map();
        for (const courseInfoRow of courseInfoRowObjects) {
            if (courseInfoRow.size != 0) {
                const programme = courseInfoRow.has("programme_name")
                    ? courseInfoRow.get("programme_name").toString()
                    : courseInfoRow.get("course_name").toString();
                const start_time = courseInfoRow.has("start_time")
                    ? new Date(courseInfoRow.get("start_time").toString())
                    : null;
                const end_time = courseInfoRow.has("end_time")
                    ? new Date(courseInfoRow.get("end_time").toString())
                    : null;
                const days_to_avoid = courseInfoRow.has("days_to_avoid")
                    ? courseInfoRow.get("days_to_avoid").toString().split(",").map(Number)
                    : [];
                const avoid_month_start = courseInfoRow.has("avoid_month_start") &&
                    courseInfoRow.get("avoid_month_start") == "Y"
                    ? true
                    : false;
                const avoid_month_end = courseInfoRow.has("avoid_month_end") &&
                    courseInfoRow.get("avoid_month_end") == "Y"
                    ? true
                    : false;
                const split = courseInfoRow.has("split")
                    ? courseInfoRow.get("split").toString().split("-").map(Number)
                    : [];
                const trainers = this.formatTrainers(courseInfoRow.get("trainers").toString(), Number(courseInfoRow.get("days_per_run")));
                const courseConfig = {
                    course_name: courseInfoRow.get("course_name").toString(),
                    fy: fy,
                    days_per_run: Number(courseInfoRow.get("days_per_run")),
                    runs_per_year: Number(courseInfoRow.get("runs_per_year")),
                    course_fees: Number(courseInfoRow.get("course_fees")),
                    start_time: start_time,
                    end_time: end_time,
                    days_to_avoid: days_to_avoid,
                    avoid_month_start: avoid_month_start,
                    avoid_month_end: avoid_month_end,
                    split: split,
                    trainers: trainers,
                    createdAt: undefined,
                    updatedAt: undefined,
                };
                arrCourseConfigs.push(courseConfig);
                if (courseInfoRow.get("to_generate") === "Y") {
                    if (tempHolder.has(programme)) {
                        tempHolder.get(programme).push(courseConfig);
                    }
                    else {
                        tempHolder.set(programme, [courseConfig]);
                    }
                }
            }
        }
        for (const [, configs] of tempHolder) {
            if (configs.length > 1) {
                multiModuleToGenerate.push(configs);
            }
            else {
                coursesToGenerate.push(configs[0]);
            }
        }
        return [arrCourseConfigs, coursesToGenerate, multiModuleToGenerate];
    }
    constructCourseRun(courseName, fy, run) {
        const courseRun = {
            course_name: courseName,
            fy: fy,
            run: run,
            createdAt: undefined,
            updatedAt: undefined,
        };
        return courseRun;
    }
    constructCourseSegment(courseName, fy, run, segment, dates) {
        const courseSegment = {
            course_name: courseName,
            fy: fy,
            run: run,
            segment: segment,
            status: client_1.Status.GENERATED,
            dates: dates,
            createdAt: undefined,
            updatedAt: undefined,
        };
        return courseSegment;
    }
    constructAssignment(courseName, fy, run, segment, trainer) {
        const assignment = {
            course_name: courseName,
            fy: fy,
            run: run,
            segment: segment,
            user_name: trainer,
            assignment_status: client_1.Status.GENERATED,
            decline_reason: undefined,
            createdAt: undefined,
            updatedAt: undefined,
        };
        return assignment;
    }
    constructFyData(dayLimit, blackoutPeriods, decreasedManpowerPeriods) {
        const fyData = {
            day_limit: dayLimit,
            blackout_dates: blackoutPeriods,
            low_manpower_dates: decreasedManpowerPeriods,
        };
        return fyData;
    }
    formatTrainers(trainers, daysPerRun) {
        const trainersArr = trainers.split(";");
        const baseArr = Array.from({ length: daysPerRun }, (_, i) => i + 1);
        const trainerTeachingDaysMap = {};
        for (const trainer of trainersArr) {
            let trainerName = trainer;
            let daysToTeach = baseArr;
            if (trainer.includes("(") && trainer.includes(")")) {
                const matches = trainer.match(/\((.*?)\)/);
                daysToTeach = matches[1].split(",").map(Number);
                trainerName = trainer.substring(0, trainer.indexOf("("));
            }
            trainerTeachingDaysMap[trainerName] = daysToTeach;
        }
        return trainerTeachingDaysMap;
    }
    initYear(y, maxCourseRunsPerDay, startMonth, endMonth) {
        const year = {};
        for (let m = startMonth; m <= endMonth; m++) {
            const month = { weeks: {} };
            const weeks = {};
            const lastDayDate = new Date(y, m + 1, 0);
            const lastDay = lastDayDate.getDate();
            const firstDayDate = new Date(y, m, 1);
            let day = 1;
            let dayOfTheWeek = firstDayDate.getDay();
            let currentWeek = 0;
            let currentWeekArr = new Array(5).fill(0);
            if (dayOfTheWeek === 6) {
                weeks[currentWeek] = currentWeekArr;
                dayOfTheWeek = 1;
                day = 3;
                currentWeek = 1;
                currentWeekArr = new Array(5).fill(0);
            }
            else if (dayOfTheWeek === 0) {
                dayOfTheWeek = 1;
                day = 2;
            }
            while (day <= lastDay) {
                currentWeekArr[dayOfTheWeek - 1] = maxCourseRunsPerDay;
                dayOfTheWeek++;
                if (dayOfTheWeek === 6) {
                    weeks[currentWeek] = currentWeekArr;
                    currentWeekArr = Array(5).fill(0);
                    day += 2;
                    currentWeek++;
                    dayOfTheWeek = 1;
                }
                day++;
            }
            if (this.sumArray(currentWeekArr) !== 0) {
                weeks[currentWeek] = currentWeekArr;
            }
            month["weeks"] = weeks;
            year[m] = month;
        }
        return year;
    }
    getWeekFromDate(date) {
        const yy = date.getFullYear();
        const mm = date.getMonth();
        const dd = date.getDate();
        const dayOfWeek = date.getDay();
        const firstDayOfMonth = new Date(yy, mm, 1).getDay();
        const dayDiff = dayOfWeek - firstDayOfMonth + 1;
        const week = (dd - dayDiff) / 7;
        return week;
    }
    sumArray(arr) {
        return arr.reduce((a, b) => a + Number(b), 0);
    }
    parseBlackoutDates(blackoutString) {
        const parsedBlackoutDates = {};
        const blackoutPeriods = JSON.parse(blackoutString);
        for (const period in blackoutPeriods) {
            const dates = [];
            const startDate = new Date(blackoutPeriods[period]["start"]);
            const endDate = new Date(blackoutPeriods[period]["end"]);
            let currentDate = new Date(startDate);
            while (currentDate.getTime() !== endDate.getTime()) {
                dates.push(currentDate);
                currentDate = new Date(currentDate);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            dates.push(endDate);
            parsedBlackoutDates[period] = dates;
        }
        return parsedBlackoutDates;
    }
    parseLowManpowerDates(lowManpowerString) {
        const parsedLowManpowerDates = {};
        const lowManpowerPeriods = JSON.parse(lowManpowerString);
        for (const period in lowManpowerPeriods) {
            const lowManpowerPeriod = {};
            const dates = [];
            const startDate = new Date(lowManpowerPeriods[period]["start"]);
            const endDate = new Date(lowManpowerPeriods[period]["end"]);
            let currentDate = new Date(startDate);
            while (currentDate.getTime() !== endDate.getTime()) {
                dates.push(currentDate);
                currentDate = new Date(currentDate);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            dates.push(endDate);
            lowManpowerPeriod["dates"] = dates;
            lowManpowerPeriod["day_limit"] = lowManpowerPeriods[period]["day_limit"];
            parsedLowManpowerDates[period] = lowManpowerPeriod;
        }
        return parsedLowManpowerDates;
    }
    determineDayLimit(lowManpowerPeriods, date, defaultCap) {
        for (const period of Object.values(lowManpowerPeriods)) {
            const dates = period["dates"].map((d) => new Date(d).getTime());
            if (dates.includes(date.getTime())) {
                return period["day_limit"];
            }
        }
        return defaultCap;
    }
}
exports.SchedulerHelper = SchedulerHelper;
//# sourceMappingURL=scheduler.helper.js.map