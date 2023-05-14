import { Status } from "@prisma/client";
export declare class UpdateCourseSegmentDto {
    segment: number;
    run: number;
    course_name: string;
    fy: string;
    new_status: Status;
}
