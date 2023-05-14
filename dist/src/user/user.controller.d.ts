import { GetUserDto, UpdateUserDto } from "./dto";
import { UserService } from "./user.service";
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getUsers(): Promise<import(".prisma/client").User[]>;
    getTrainers(): Promise<{
        user_name: string;
    }[]>;
    getUser(body: GetUserDto): Promise<import(".prisma/client").User>;
    patchUser(updateUserDto: UpdateUserDto): Promise<import(".prisma/client").User>;
    ifUserExist(body: GetUserDto): Promise<boolean>;
}
