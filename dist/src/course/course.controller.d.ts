import { FilterDto, fyDto } from "src/scheduler/dto";
import { CourseService } from "./course.service";
import { CourseRunDto, CreateNewCourseDto, GetProgrammeDto, GetCourseConfigDto, UpdateCourseSegmentDto, EditCourseSegmentDto, CourseFilterDto } from "./dto";
import { Response } from "express";
import { AssignmentDto } from "./dto/get-assignment.dto";
export declare class CourseController {
    private courseService;
    constructor(courseService: CourseService);
    getCourses(body: fyDto): Promise<any[]>;
    filterCourses(body: CourseFilterDto): Promise<any[]>;
    getCourseDetails(body: GetCourseConfigDto): Promise<import(".prisma/client").CourseConfig & {
        Course: import(".prisma/client").Course;
    }>;
    deleteCourse(body: GetCourseConfigDto): Promise<any>;
    getProgrammes(): Promise<import(".prisma/client").Programme[]>;
    getProgramme(body: GetProgrammeDto): Promise<import(".prisma/client").Programme>;
    updateCourseSegmentStatus(body: UpdateCourseSegmentDto[]): Promise<any>;
    updateAssignmentStatus(body: AssignmentDto[]): Promise<any>;
    editCourseRun(body: EditCourseSegmentDto): Promise<any>;
    exportCourseSegment(res: Response, dto: FilterDto): Promise<void | Response<any, Record<string, any>>>;
    deleteCourseRun(body: CourseRunDto): Promise<any>;
    createNewCourse(body: CreateNewCourseDto): Promise<any>;
}
