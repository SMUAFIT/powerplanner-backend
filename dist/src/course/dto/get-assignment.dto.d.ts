import { Status } from "@prisma/client";
export declare class AssignmentDto {
    user_name: string;
    segment: number;
    run: number;
    course_name: string;
    fy: string;
    new_status: Status;
    decline_reason: string;
}
