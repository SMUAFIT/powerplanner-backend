import { Status } from "@prisma/client";
import { CreateCourseSegmentDto } from "./create-course-segment.dto";
declare const EditCourseSegmentDto_base: import("@nestjs/common").Type<Partial<CreateCourseSegmentDto>>;
export declare class EditCourseSegmentDto extends EditCourseSegmentDto_base {
    bypass: number;
    newTrainerList: Array<string>;
    status: Status;
}
export {};
