import { ConsoleLogger } from '@nestjs/common';
export declare class CustomLogger extends ConsoleLogger {
    success(data?: any): void;
    successCreate(data?: any): void;
}
