export declare const courseConfig_seed: ({
    course_name: string;
    fy: string;
    days_per_run: number;
    runs_per_year: number;
    course_fees: number;
    days_to_avoid: any[];
    avoid_month_start: boolean;
    avoid_month_end: boolean;
    split: any[];
    trainers: {
        "Ash Ketchum": number[];
        "Naruto Uzumaki": number[];
    };
} | {
    course_name: string;
    fy: string;
    days_per_run: number;
    runs_per_year: number;
    course_fees: number;
    days_to_avoid: any[];
    avoid_month_start: boolean;
    avoid_month_end: boolean;
    split: any[];
    trainers: {
        "Naruto Uzumaki": number[];
        "Ash Ketchum"?: undefined;
    };
} | {
    course_name: string;
    fy: string;
    days_per_run: number;
    runs_per_year: number;
    course_fees: number;
    days_to_avoid: number[];
    avoid_month_start: boolean;
    avoid_month_end: boolean;
    split: any[];
    trainers: {
        "Ash Ketchum": number[];
        "Naruto Uzumaki"?: undefined;
    };
})[];
