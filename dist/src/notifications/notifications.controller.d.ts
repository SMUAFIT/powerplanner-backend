import { GetCourseSegmentDto } from "src/course/dto/get-course-segment.dto";
import { NotificationsService } from "./notifications.service";
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    adhocEmail(body: GetCourseSegmentDto[]): Promise<any>;
}
