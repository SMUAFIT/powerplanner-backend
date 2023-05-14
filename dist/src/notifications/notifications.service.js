"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const dist_1 = require("@nestjs-modules/mailer/dist");
const trainer_service_1 = require("../trainer/trainer.service");
const user_service_1 = require("../user/user.service");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_config_1 = require("./notification.config");
let NotificationsService = class NotificationsService {
    constructor(prisma, mailerService, trainerService, userService, configService) {
        this.prisma = prisma;
        this.mailerService = mailerService;
        this.trainerService = trainerService;
        this.userService = userService;
        this.configService = configService;
        this.FRONTEND_URL = this.configService.get("FRONTEND_URL");
        this.VERSION_REGEX = /:V[0-9]$/;
    }
    sendEmail(email) {
        this.mailerService
            .sendMail({
            to: email.to,
            from: email.from,
            subject: email.subject,
            html: email.html,
        })
            .then((res) => {
            return {
                message: "Email sent successfully",
            };
        })
            .catch((error) => {
            console.log(error);
            return {
                message: error.message,
            };
        });
    }
    async sendAdhocEmail(courseSegmentArr) {
        try {
            const resultsArray = [];
            for (let i = 0; i < courseSegmentArr.length; i++) {
                const courseSegment = await this.prisma.courseSegment.findUnique({
                    where: {
                        segment_course_name_fy_run: {
                            segment: courseSegmentArr[i].segment,
                            course_name: courseSegmentArr[i].course_name,
                            fy: courseSegmentArr[i].fy,
                            run: courseSegmentArr[i].run,
                        },
                    },
                });
                resultsArray.push(courseSegment);
            }
            await this.notifyTrainersBySegments(resultsArray);
            return {
                message: "Emails sent successfully",
            };
        }
        catch (error) {
            return error;
        }
    }
    sendWelcomeEmail(user_email, user_name, rawPassword) {
        const email = this.craftWelcomeEmail(user_email, user_name, rawPassword);
        return this.sendEmail(email);
    }
    sendResetPasswordEmail(user_email, user_name, rawPassword) {
        const email = this.craftResetPasswordTemplate(user_email, user_name, rawPassword);
        return this.sendEmail(email);
    }
    async notifyTrainersBySegments(segments) {
        const segmentsByTrainer = await this.groupSegmentsByTrainer(segments);
        for (const [trainer, segments] of segmentsByTrainer) {
            const getUserDto = { user_name: trainer };
            const trainerEmail = (await this.userService.getUser(getUserDto)).email;
            const email = this.craftTrainerCourseEmail(trainerEmail, trainer, segments);
            this.sendEmail(email);
        }
    }
    async notifyNewlyAssignedTrainers(trainers, dto) {
        for (const trainer of trainers) {
            const getUserDto = { user_name: trainer };
            const trainerEmail = (await this.userService.getUser(getUserDto)).email;
            const email = this.craftNewlyAssignedEmail(trainerEmail, trainer, dto);
            this.sendEmail(email);
        }
    }
    async notifyUnassignedTrainers(trainers, dto) {
        for (const trainer of trainers) {
            const getUserDto = { user_name: trainer };
            const trainerEmail = (await this.userService.getUser(getUserDto)).email;
            const email = this.craftUnassignedEmail(trainerEmail, trainer, dto);
            this.sendEmail(email);
        }
    }
    craftNewlyAssignedEmail(trainerEmail, trainer, dto) {
        const segment = {
            course_name: dto.course_name,
            segment: dto.segment,
            run: dto.run,
            fy: dto.fy,
            dates: dto.dates.map((dateString) => new Date(dateString)),
            status: client_1.Status.PENDING,
            createdAt: undefined,
            updatedAt: undefined,
        };
        const email = {
            to: trainerEmail,
            from: notification_config_1.FROM_ADDRESS,
            subject: `SMU Academy: You have been assigned a new course: ${dto.course_name}`,
            html: this.renderPendingTemplate(trainer, [segment]),
        };
        return email;
    }
    craftUnassignedEmail(trainerEmail, trainer, dto) {
        const email = {
            to: trainerEmail,
            from: notification_config_1.FROM_ADDRESS,
            subject: `SMU Academy: You have been unassigned from a course: ${dto.course_name}`,
            html: this.renderUnassignedTemplate(trainer, dto),
        };
        return email;
    }
    craftTrainerCourseEmail(trainerEmail, trainer, segments) {
        const pendingSubject = `SMU Academy: Your response is required for new ${segments[0].fy} course schedule`;
        const confirmedOrCancelledSubject = `SMU Academy: There are updates to your course(s)`;
        const email = {
            to: trainerEmail,
            from: notification_config_1.FROM_ADDRESS,
            subject: segments.at(0).status == "PENDING"
                ? pendingSubject
                : confirmedOrCancelledSubject,
            html: segments.at(0).status == "PENDING"
                ? this.renderPendingTemplate(trainer, segments)
                : this.renderConfirmedOrCancelledTemplate(trainer, segments),
        };
        return email;
    }
    craftWelcomeEmail(trainerEmail, trainer, rawPassword) {
        const subject = `SMU Academy: Your account has been created`;
        const email = {
            to: trainerEmail,
            from: notification_config_1.FROM_ADDRESS,
            subject: subject,
            html: this.renderWelcomeTemplate(trainer, rawPassword),
        };
        return email;
    }
    craftResetPasswordTemplate(trainerEmail, trainer, rawPassword) {
        const subject = `SMU Academy: Your account password has been reset`;
        const email = {
            to: trainerEmail,
            from: notification_config_1.FROM_ADDRESS,
            subject: subject,
            html: this.renderResetPasswordTemplate(trainer, rawPassword),
        };
        return email;
    }
    async groupSegmentsByTrainer(segments) {
        const trainerMap = new Map();
        for (const segment of segments) {
            const newStatus = segment.status;
            if (newStatus == client_1.Status.PENDING ||
                newStatus == client_1.Status.CONFIRMED ||
                newStatus == client_1.Status.CANCELLED) {
                const trainers = await this.trainerService.getAssignmentTrainersByCourseSegments(segment.fy, segment.course_name, segment.segment, segment.run);
                for (const trainer of trainers) {
                    if (!trainerMap.has(trainer.user_name)) {
                        trainerMap.set(trainer.user_name, []);
                    }
                    trainerMap.get(trainer.user_name).push(segment);
                }
            }
        }
        return trainerMap;
    }
    renderUnassignedTemplate(trainerName, dto) {
        const startDate = new Date(dto.dates.at(0)).toDateString();
        const endDate = new Date(dto.dates.at(-1)).toDateString();
        const template = `
    <p>Hi ${trainerName},</p>
    <p>You have been unassigned the following course:</p>
    <table cellspacing="3" bgcolor="#000000">
      <tr bgcolor="#ffffff"><th>Course Name</th><th>Start Date</th><th>End Date</th><th>Status</th></tr>
      <tr bgcolor="#ffffff">
        <td>${dto.course_name}</td>
        <td>${startDate}</td>
        <td>${endDate}</td>
        <td>UNASSIGNED</td>
      </tr>
    </table>
    <p>Please reach out to our Programme Managers if there are any issues.
    <br/>Thank you.</p>
    ${notification_config_1.SIGN_OFF}
    `;
        return template;
    }
    renderPendingTemplate(trainerName, segments) {
        let template = `
    <p>Hi ${trainerName},</p>
    <p>You have new courses scheduled which require your approval or rejection.</p>
    <table cellspacing="3" bgcolor="#000000">
      <tr bgcolor="#ffffff"><th>Course Name</th><th>Start Date</th><th>End Date</th><th>Status</th></tr>
    `;
        for (const segment of segments) {
            const courseName = segment.course_name.replace(this.VERSION_REGEX, "");
            const startDate = segment.dates.at(0).toDateString();
            const endDate = segment.dates.at(-1).toDateString();
            template += `
      <tr bgcolor="#ffffff">
        <td>${courseName}</td>
        <td>${startDate}</td>
        <td>${endDate}</td>
        <td>${segment.status}</td>
      </tr>
      `;
        }
        template += `
    </table>
    <p>Kindly review your scheduled courses on <href>${this.FRONTEND_URL}/status</href> and accept or decline.
    <br/>Thank you.</p>
    ${notification_config_1.SIGN_OFF}
    `;
        return template;
    }
    renderConfirmedOrCancelledTemplate(trainerName, segments) {
        let template = `
    <p>Hi ${trainerName},</p>
    <p>There has been updates to the statuses of your courses.</p>
    <table cellspacing="3" bgcolor="#000000">
      <tr bgcolor="#ffffff"><th>Course Name</th><th>Start Date</th><th>End Date</th><th>New Status</th></tr>
    `;
        for (const segment of segments) {
            const courseName = segment.course_name.replace(this.VERSION_REGEX, "");
            const startDate = segment.dates.at(0).toDateString();
            const endDate = segment.dates.at(-1).toDateString();
            template += `
      <tr bgcolor="#ffffff">
        <td>${courseName}</td>
        <td>${startDate}</td>
        <td>${endDate}</td>
        <td>${segment.status}</td>
      </tr>
      `;
        }
        template += `
    </table>
    <p>You may review the changes on <href>${this.FRONTEND_URL}/status</href>.
    Please reach out to our Programme Managers if there are any issues.
    <br/>Thank you.</p>
    ${notification_config_1.SIGN_OFF}
    `;
        return template;
    }
    renderWelcomeTemplate(trainerName, password) {
        const template = `
    <p>Hi ${trainerName},</p>
    <p>You have been added as a user to SMU Academy's scheduling application.</p>
    <p>Here are your login details (key them in without the double quotes):</p>
    <p>
    Username: <b>"${trainerName}"</b>
    <br>
    Password: <b>"${password}"</b>
    </p>
    <p>Kindly login to <href>${this.FRONTEND_URL}</href> to access your account.
    <br/>Thank you.</p>
    ${notification_config_1.SIGN_OFF}
    `;
        return template;
    }
    renderResetPasswordTemplate(trainerName, password) {
        const template = `
    <p>Hi ${trainerName},</p>
    <p>Your account password on SMU Academy's scheduling application has been reset.</p>
    <p>Here is your new password (key them in without the double quotes):</p>
    <p>
    Password: <b>"${password}"</b>
    </p>
    <p>Kindly login to <href>${this.FRONTEND_URL}</href> to access your account and please <b>change</b> your password immediately.
    <br/>Thank you.</p>
    ${notification_config_1.SIGN_OFF}
    `;
        return template;
    }
};
NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        dist_1.MailerService,
        trainer_service_1.TrainerService,
        user_service_1.UserService,
        config_1.ConfigService])
], NotificationsService);
exports.NotificationsService = NotificationsService;
//# sourceMappingURL=notifications.service.js.map