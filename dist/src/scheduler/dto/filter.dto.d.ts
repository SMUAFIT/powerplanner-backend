import { DeliveryMode, Status } from "@prisma/client";
export declare class FilterDto {
    fy: string;
    programme_name: Array<string>;
    course_name: Array<string>;
    delivery_mode: Array<DeliveryMode>;
    status: Array<Status>;
    trainers: Array<string>;
    export_by_trainer: boolean;
}
