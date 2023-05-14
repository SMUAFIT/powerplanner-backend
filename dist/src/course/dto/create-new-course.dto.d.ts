import { DeliveryMode } from "@prisma/client";
export declare class CreateNewCourseDto {
    programme_name: string;
    course_name: string;
    fy: string;
    course_code: string;
    delivery_mode: DeliveryMode;
    days_per_run: number;
    runs_per_year: number;
    course_fees: number;
    start_time: string;
    end_time: string;
    days_to_avoid: number[];
    avoid_month_start: boolean;
    avoid_month_end: boolean;
    trainers: any[];
}
