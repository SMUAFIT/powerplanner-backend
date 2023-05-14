export declare const assignment_seed: ({
    user_name: string;
    segment: number;
    course_name: string;
    fy: string;
    run: number;
    assignment_status: "GENERATED";
    decline_reason?: undefined;
} | {
    user_name: string;
    segment: number;
    course_name: string;
    fy: string;
    run: number;
    assignment_status: "PENDING";
    decline_reason?: undefined;
} | {
    user_name: string;
    segment: number;
    course_name: string;
    fy: string;
    run: number;
    assignment_status: "ACCEPTED";
    decline_reason?: undefined;
} | {
    user_name: string;
    segment: number;
    course_name: string;
    fy: string;
    run: number;
    assignment_status: "DECLINED";
    decline_reason: string;
} | {
    user_name: string;
    segment: number;
    course_name: string;
    fy: string;
    run: number;
    assignment_status?: undefined;
    decline_reason?: undefined;
})[];
