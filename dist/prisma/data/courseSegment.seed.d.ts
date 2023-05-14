declare enum Status {
    generated = "GENERATED",
    reviewed = "REVIEWED",
    pending = "PENDING",
    accepted = "ACCEPTED",
    declined = "DECLINED",
    confirmed = "CONFIRMED",
    cancelled = "CANCELLED"
}
export declare const courseSegment_seed: ({
    segment: number;
    course_name: string;
    fy: string;
    run: number;
    dates: Date[];
    status?: undefined;
} | {
    segment: number;
    course_name: string;
    fy: string;
    run: number;
    dates: Date[];
    status: Status;
})[];
export {};
