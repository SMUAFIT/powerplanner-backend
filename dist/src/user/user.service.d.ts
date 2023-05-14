import { PrismaService } from "../prisma/prisma.service";
import { GetUserDto, UpdateUserDto } from "./dto";
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    getUsers(): Promise<import(".prisma/client").User[]>;
    getUser(dto: GetUserDto): Promise<import(".prisma/client").User>;
    getTrainers(): Promise<{
        user_name: string;
    }[]>;
    patchUser(updateUserDto: UpdateUserDto): Promise<import(".prisma/client").User>;
    ifUserExist(user_name: string): Promise<boolean>;
}
