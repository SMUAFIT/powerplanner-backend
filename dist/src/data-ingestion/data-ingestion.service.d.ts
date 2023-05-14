/// <reference types="multer" />
import { CellValue, Worksheet } from "exceljs";
export declare class DataIngestionService {
    parseSchedulingExcel(file: Express.Multer.File, fiscalYear: string): Promise<[
        Array<Map<string, CellValue>>,
        Map<number, string>,
        Array<Map<string, CellValue>>,
        Map<number, string>
    ]>;
    parseManualAddExcel(file: Express.Multer.File, fy: string): Promise<[Map<string, CellValue>[], Map<number, string>]>;
    extractRowObjects(sheet: Worksheet, fiscalYear?: string): any;
    mandatoryColsCheck(isCourseInfo: boolean, filledCols: Set<number>): string;
    fiscalYearCheck(cellValue: CellValue, fiscalYear: string): boolean;
}
