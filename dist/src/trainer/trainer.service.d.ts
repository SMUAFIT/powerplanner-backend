import { CourseSegment } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
export declare class TrainerService {
    private prisma;
    constructor(prisma: PrismaService);
    getTrainerClashes(courseSegmentsOnSameDays: Map<string, CourseSegment[]>, fy: string, courseName: string, segment: number, run: number, newTrainerList: Array<string>): Promise<Map<string, Array<Date>>>;
    getAssignmentsTrainersSegmentDatesOfFy(fy: string): Promise<{
        user_name: string;
        CourseSegment: {
            dates: Date[];
        };
    }[]>;
    getAssignmentTrainersByCourseSegments(fy: string, course_name: string, segment: number, run: number): Promise<{
        user_name: string;
    }[]>;
}
