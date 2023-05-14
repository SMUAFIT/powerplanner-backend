import { DeliveryMode } from "@prisma/client";
export declare class CourseFilterDto {
    fy: string;
    programme_name: Array<string>;
    course_name: Array<string>;
    delivery_mode: Array<DeliveryMode>;
    trainers: Array<string>;
}
