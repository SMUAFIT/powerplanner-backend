import { PrismaService } from "../prisma/prisma.service";
import { AuthDto, LoginDto, ResetPasswordDto } from "./dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { NotificationsService } from "../notifications/notifications.service";
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private notificationsService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, notificationsService: NotificationsService);
    signup(dto: AuthDto, response: Response): Promise<string>;
    signin(dto: LoginDto, response: Response): Promise<import(".prisma/client").User>;
    signinToken(dto: LoginDto, response: Response): Promise<{
        access_token: string;
    }>;
    signout(response: Response): Promise<void>;
    resetPassword(resetPasswordDto: ResetPasswordDto, response: Response): Promise<{
        user_name: string;
        email: string;
    }>;
    changePassword(dto: ChangePasswordDto, response: Response): Promise<string>;
    signToken(user_name: string, email: string): Promise<{
        access_token: string;
    }>;
}
