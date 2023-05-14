import { Assignment, Course, CourseConfig, CourseRun, CourseSegment, Prisma, Programme } from "@prisma/client";
import { CellValue } from "exceljs";
import { Year } from "src/interfaces/calendar.interface";
import { BlackoutDates, LowManpowerDates } from "src/interfaces/new_schedule_inputs.interface";
export declare class SchedulerHelper {
    splitCoursesByPriority(courses: CourseConfig[]): CourseConfig[][];
    generateDatesFromWeek(year: number, month: number, bestWeek: number, bestDayToStart: number, numDays: number): Date[];
    generateDateFromWeek(year: number, month: number, week: number, day: number): Date;
    constructManyProgramme(courseInfoRowObjects: Array<Map<string, CellValue>>): Array<Programme>;
    constructManyCourses(courseInfoRowObjects: Array<Map<string, CellValue>>): Array<Course>;
    constructManyCourseConfigs(courseInfoRowObjects: Array<Map<string, CellValue>>, fy: string): [CourseConfig[], CourseConfig[], CourseConfig[][]];
    constructCourseRun(courseName: string, fy: string, run: number): CourseRun;
    constructCourseSegment(courseName: string, fy: string, run: number, segment: number, dates: Date[]): CourseSegment;
    constructAssignment(courseName: string, fy: string, run: number, segment: number, trainer: string): Assignment;
    constructFyData(dayLimit: number, blackoutPeriods: any, decreasedManpowerPeriods: any): object;
    formatTrainers(trainers: string, daysPerRun: number): Prisma.JsonObject;
    initYear(y: number, maxCourseRunsPerDay: number, startMonth: number, endMonth: number): Year;
    getWeekFromDate(date: Date): number;
    sumArray(arr: number[]): number;
    parseBlackoutDates(blackoutString: string): BlackoutDates;
    parseLowManpowerDates(lowManpowerString: string): LowManpowerDates;
    determineDayLimit(lowManpowerPeriods: {}, date: Date, defaultCap: number): number;
}
