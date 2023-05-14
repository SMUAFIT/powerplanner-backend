"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon = require("argon2");
const data_1 = require("./data");
const prisma = new client_1.PrismaClient();
const hashPassword = async (password) => {
    let pw = await argon.hash(password);
    return pw;
};
async function main() {
    for (let user of data_1.seed_users) {
        user.password = await hashPassword(user.password);
    }
    await prisma.user.createMany({
        data: data_1.seed_users,
    });
    await prisma.fiscalYear.createMany({
        data: data_1.seed_fiscal_years,
    });
    await prisma.programme.createMany({
        data: data_1.programme_seed,
    });
    await prisma.course.createMany({
        data: data_1.course_seed,
    });
    await prisma.courseConfig.createMany({
        data: data_1.courseConfig_seed,
    });
    await prisma.courseRun.createMany({
        data: data_1.courseRun_seed,
    });
    await prisma.courseSegment.createMany({
        data: data_1.courseSegment_seed,
    });
    await prisma.assignment.createMany({
        data: data_1.assignment_seed,
    });
    await prisma.notification.createMany({
        data: data_1.notification_seed,
    });
    process.exit(0);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map