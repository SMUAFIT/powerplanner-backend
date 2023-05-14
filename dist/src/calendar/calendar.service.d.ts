import { PrismaService } from "../prisma/prisma.service";
export declare class CalendarService {
    private prisma;
    constructor(prisma: PrismaService);
    getCoursesOnDate(date: Date): Promise<import(".prisma/client").CourseSegment[]>;
}
