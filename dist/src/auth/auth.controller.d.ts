import { AuthService } from "./auth.service";
import { AuthDto, LoginDto, ResetPasswordDto } from "./dto";
import { Response } from "express";
import { ChangePasswordDto } from "./dto/change-password.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(body: AuthDto, response: Response): Promise<void>;
    signin(body: LoginDto, response: Response): Promise<void>;
    changePassword(dto: ChangePasswordDto, response: Response): Promise<string>;
    signinToken(body: LoginDto, response: Response): Promise<{
        access_token: string;
    }>;
    signout(response: Response): Promise<{
        status: number;
    }>;
    resetPassword(body: ResetPasswordDto, response: Response): Promise<{
        user_name: string;
        email: string;
    }>;
}
