"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignment_seed = void 0;
const client_1 = require("@prisma/client");
exports.assignment_seed = [
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 101",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 101",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 101",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Python 101",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 101",
        fy: "2023-2024",
        run: 4,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 101:V2",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 111:V2",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 111:V3",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 111",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 111",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 111",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 111",
        fy: "2023-2024",
        run: 4,
        assignment_status: client_1.Status.DECLINED,
        decline_reason: "I can't make it for the proposed date, how about the next week?",
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 122: For the Experts",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 122: For the Experts",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 122: For the Experts",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 122: For the Experts",
        fy: "2023-2024",
        run: 4,
        assignment_status: client_1.Status.DECLINED,
        decline_reason: "Please reschedule for the next week, can do Python 111 for the first half of the week though!",
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 122: For the Experts:V2",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 122: For the Experts:V3",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Python 122: For the Experts:V4",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Ruby Fundamentals",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Ruby Fundamentals",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Ruby Fundamentals",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Ruby Fundamentals",
        fy: "2023-2024",
        run: 4,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Ruby Intermediate",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Ruby Intermediate",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Ruby Intermediate",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Ruby Intermediate",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Ruby Expert",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Ruby Expert",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Ruby Expert",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.DECLINED,
        decline_reason: "I can't make it for the proposed date, how about the previous week?",
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Google's Language: GO Basic I",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Google's Language: GO Basic I",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Google's Language: GO Basic II",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Google's Language: GO Basic II",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design I",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design II",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design III",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design III",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design III",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design III",
        fy: "2023-2024",
        run: 4,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design III",
        fy: "2023-2024",
        run: 5,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design III",
        fy: "2023-2024",
        run: 6,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design IV",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Business Design IV",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Business Design IV",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design V",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.DECLINED,
        decline_reason: "CMI!",
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design V",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Business Design V",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Business Design V",
        fy: "2023-2024",
        run: 4,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design V",
        fy: "2023-2024",
        run: 5,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Business Design V",
        fy: "2023-2024",
        run: 6,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Procrastination 1: Basic",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Procrastination 1: Basic",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Procrastination 1: Basic",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Procrastination 1: Intermediate",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.DECLINED,
        decline_reason: "I can't make it but let me get back to you ASAP with my availability"
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Procrastination 1: Intermediate",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Procrastination 1: Intermediate",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 4,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 5,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 6,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 7,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 8,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 9,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 10,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 11,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 12,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience I",
        fy: "2023-2024",
        run: 13,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 4,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 5,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 6,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 7,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 8,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 9,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 10,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 11,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience II",
        fy: "2023-2024",
        run: 12,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 2,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 3,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 4,
        assignment_status: client_1.Status.DECLINED,
        decline_reason: "Will be on holiday during that week!"
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 5,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 6,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 7,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 8,
        assignment_status: client_1.Status.PENDING,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 9,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 10,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 11,
        assignment_status: client_1.Status.ACCEPTED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 12,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 13,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 1,
        course_name: "Leading the audience III",
        fy: "2023-2024",
        run: 14,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Ash Ketchum",
        segment: 1,
        course_name: "Split: Trainers",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
    {
        user_name: "Naruto Uzumaki",
        segment: 2,
        course_name: "Split: Trainers",
        fy: "2023-2024",
        run: 1,
        assignment_status: client_1.Status.GENERATED,
    },
];
//# sourceMappingURL=assignment.seed.js.map