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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const argon = require("argon2");
const runtime_1 = require("@prisma/client/runtime");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const notifications_service_1 = require("../notifications/notifications.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, notificationsService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.notificationsService = notificationsService;
    }
    async signup(dto, response) {
        const rawPassword = dto.password;
        const password = await argon.hash(rawPassword);
        dto.password = password;
        try {
            const exist = await this.prisma.user.findMany({
                where: {
                    user_name: {
                        equals: dto.user_name,
                        mode: "insensitive",
                    },
                },
            });
            if (exist.length > 0)
                throw new common_1.ForbiddenException("Username taken");
            const user = await this.prisma.user.create({
                data: Object.assign({}, dto),
            });
            await this.notificationsService.sendWelcomeEmail(user.email, user.user_name, rawPassword);
            return user.user_name;
        }
        catch (error) {
            if (error instanceof runtime_1.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new common_1.ForbiddenException("Credentials taken");
                }
            }
            throw error;
        }
    }
    async signin(dto, response) {
        const user = await this.prisma.user.findUnique({
            where: {
                user_name: dto.user_name,
            },
        });
        if (!user)
            throw new common_1.ForbiddenException("Credentials incorrect");
        const pwMatches = await argon.verify(user.password, dto.password);
        if (!pwMatches)
            throw new common_1.ForbiddenException("Credentials incorrect");
        delete user.password;
        return user;
    }
    async signinToken(dto, response) {
        const user = await this.prisma.user.findUnique({
            where: {
                user_name: dto.user_name,
            },
        });
        if (!user)
            throw new common_1.ForbiddenException("Credentials incorrect");
        const pwMatches = await argon.verify(user.password, dto.password);
        if (!pwMatches)
            throw new common_1.ForbiddenException("Credentials incorrect");
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + this.configService.get("JWT_EXPIRATION"));
        const token = this.signToken(user.user_name, user.email);
        return token;
    }
    async signout(response) {
        response.cookie("Authentication", "", {
            httpOnly: true,
            expires: new Date(),
        });
    }
    async resetPassword(resetPasswordDto, response) {
        const user = await this.prisma.user.findFirst({
            where: {
                user_name: resetPasswordDto.user_name,
                email: resetPasswordDto.email,
            },
        });
        if (user) {
            const password = await argon.hash(resetPasswordDto.password);
            try {
                const user = await this.prisma.user.update({
                    where: {
                        user_name: resetPasswordDto.user_name,
                    },
                    data: {
                        password: password,
                    },
                });
                await this.notificationsService.sendResetPasswordEmail(user.email, user.user_name, resetPasswordDto.password);
                return { user_name: user.user_name, email: user.email };
            }
            catch (error) {
                if (error instanceof runtime_1.PrismaClientKnownRequestError) {
                    if (error.code === "P2002") {
                        throw new common_1.ForbiddenException("Credentials taken");
                    }
                }
                throw error;
            }
        }
        else {
            throw new common_1.ForbiddenException("Credentials incorrect");
        }
    }
    async changePassword(dto, response) {
        const user = await this.prisma.user.findUnique({
            where: {
                user_name: dto.user_name,
            },
        });
        if (!user)
            throw new common_1.ForbiddenException("Credentials incorrect");
        const pwMatches = await argon.verify(user.password, dto.currentPassword);
        if (!pwMatches)
            throw new common_1.ForbiddenException("Credentials incorrect");
        const password = await argon.hash(dto.newPassword);
        dto.newPassword = password;
        try {
            const user = await this.prisma.user.update({
                where: {
                    user_name: dto.user_name,
                },
                data: {
                    password: dto.newPassword,
                },
            });
            return user.user_name;
        }
        catch (error) {
            if (error instanceof runtime_1.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new common_1.ForbiddenException("Credentials taken");
                }
            }
            throw error;
        }
    }
    async signToken(user_name, email) {
        const payload = {
            user_name: user_name,
            email,
        };
        const secret = this.configService.get("JWT_SECRET");
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: `${this.configService.get("JWT_EXPIRATION")}s`,
            secret: secret,
        });
        return {
            access_token: token,
        };
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map