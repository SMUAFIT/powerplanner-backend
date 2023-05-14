export declare const seed_fiscal_years: ({
    fy: string;
    revenue_target: number;
    day_limit: number;
    blackout_dates: {
        "Term 1 Finals": string[];
        "Term 2 Finals": string[];
    };
    low_manpower_dates: {
        "Winter Break": {
            day_limit: number;
            dates: string[];
        };
    };
} | {
    fy: string;
    revenue_target: number;
    day_limit: number;
    blackout_dates: {
        "Term 1 Finals"?: undefined;
        "Term 2 Finals"?: undefined;
    };
    low_manpower_dates: {
        "Winter Break"?: undefined;
    };
})[];
