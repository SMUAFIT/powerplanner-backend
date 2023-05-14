/// <reference types="multer" />
import { SchedulerService } from "./scheduler.service";
import { ScheduleDto, HolidayDto, FilterDto, fyDto, ManualDto, trainerFilterDto } from "./dto";
import { Response } from "express";
import { AddItemsOnHoldDto } from "./dto/add-items-on-hold.dto";
export declare class SchedulerController {
    private readonly schedulerService;
    constructor(schedulerService: SchedulerService);
    scheduleNew(res: Response, body: ScheduleDto, file: Express.Multer.File): Promise<any>;
    getPublicHolidays(body: HolidayDto): Promise<{
        [k: string]: string;
    }>;
    getTrainerFilterOptions(body: trainerFilterDto): Promise<any>;
    getPMFilterOptions(body: fyDto): Promise<any>;
    getCalendarFilterResults(dto: FilterDto): Promise<any[]>;
    getBlackoutDates(body: fyDto): Promise<any[]>;
    getFilterResults(dto: FilterDto): Promise<any[]>;
    manualAdd(body: ManualDto, file: Express.Multer.File): any;
    approveWarnings(res: Response, dto: AddItemsOnHoldDto): Promise<void>;
}
