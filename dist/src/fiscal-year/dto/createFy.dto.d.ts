import { Prisma } from "@prisma/client";
export declare class CreateFyDto {
    constructor(fy: string, day_limit: number, blackout_dates: Prisma.JsonObject, low_manpower_dates: Prisma.JsonObject);
    fy: string;
    revenue_target: number;
    day_limit: number;
    blackout_dates: Prisma.JsonObject;
    low_manpower_dates: Prisma.JsonObject;
}
