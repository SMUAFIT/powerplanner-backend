import { Role } from "@prisma/client";
export declare class AuthDto {
    user_name: string;
    email: string;
    password: string;
    role: Role;
}
