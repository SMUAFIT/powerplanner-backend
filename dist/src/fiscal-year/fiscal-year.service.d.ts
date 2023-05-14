import { FiscalYear } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
export declare class FiscalYearService {
    private prism;
    constructor(prism: PrismaService);
    patchFiscalYear(params: {
        where: any;
        data: any;
    }): Promise<FiscalYear>;
    getFiscalYear(params: {
        where: any;
    }): Promise<FiscalYear>;
    getBlackoutDatesClashes(dates: Array<string>, blackoutDates: Map<string, Array<string>>): Promise<Map<string, Array<Date>>>;
}
