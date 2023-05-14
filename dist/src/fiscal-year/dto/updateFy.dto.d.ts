import { CreateFyDto } from "./createFy.dto";
declare const UpdateFyDto_base: import("@nestjs/common").Type<Partial<CreateFyDto>>;
export declare class UpdateFyDto extends UpdateFyDto_base {
    constructor({ fy, day_limit, blackout_dates, low_manpower_dates, }: {
        fy?: string;
        day_limit?: number;
        blackout_dates?: any;
        low_manpower_dates?: any;
    });
}
export {};
