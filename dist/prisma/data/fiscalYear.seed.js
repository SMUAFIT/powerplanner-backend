"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed_fiscal_years = void 0;
exports.seed_fiscal_years = [
    {
        fy: "2022-2023",
        revenue_target: 500000.0,
        day_limit: 7,
        blackout_dates: {
            "Term 1 Finals": ['2022-11-21', '2022-11-22', '2022-11-23', '2022-11-24', '2022-11-25', '2022-11-28', '2022-11-29', '2022-11-30', '2022-12-01', '2022-12-02'],
            "Term 2 Finals": ['2023-03-17', '2023-03-18', '2023-03-19', '2023-03-20', '2023-03-21', '2023-03-24', '2023-03-25', '2023-03-26', '2023-03-27', '2023-03-28']
        },
        low_manpower_dates: {
            "Winter Break": {
                "day_limit": 3,
                "dates": [
                    '2022-12-05', '2022-12-06', '2022-12-07', '2022-12-08', '2022-12-09',
                    '2022-12-12', '2022-12-13', '2022-12-14', '2022-12-15', '2022-12-16',
                    '2022-12-19', '2022-12-20', '2022-12-21', '2022-12-22', '2022-12-23',
                    '2022-12-26', '2022-12-27', '2022-12-28', '2022-12-29', '2022-12-30',
                    '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05', '2023-01-06',
                ]
            }
        }
    },
    {
        fy: "2023-2024",
        revenue_target: 500000.0,
        day_limit: 7,
        blackout_dates: {},
        low_manpower_dates: {}
    },
    {
        fy: "2024-2025",
        revenue_target: 500000.0,
        day_limit: 7,
        blackout_dates: {},
        low_manpower_dates: {}
    },
    {
        fy: "2025-2026",
        revenue_target: 500000.0,
        day_limit: 7,
        blackout_dates: {},
        low_manpower_dates: {}
    }
];
//# sourceMappingURL=fiscalYear.seed.js.map