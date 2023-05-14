import { Role } from "@prisma/client";
export declare class CreateUserDto {
    user_name: string;
    email: string;
    password: string;
    role: Role;
}
