import { DeliveryMode } from "@prisma/client";
export declare class CourseDto {
    course_name: string;
    programme_name: string;
    course_code: string;
    delivery_mode: DeliveryMode;
}
