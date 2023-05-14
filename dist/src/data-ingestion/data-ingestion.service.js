"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataIngestionService = void 0;
const common_1 = require("@nestjs/common");
const exceljs_1 = require("exceljs");
const fieldMapping = require("./excel_to_db_field_mapping.json");
let DataIngestionService = class DataIngestionService {
    async parseSchedulingExcel(file, fiscalYear) {
        const workBook = new exceljs_1.Workbook();
        const [courseInfoRowObjects, courseInfoValidationObjects, manualAdditionRowObjects, manualValidationObjects,] = await workBook.xlsx.load(file.buffer).then(() => {
            const courseInfoSheet = workBook.getWorksheet("Course Information");
            const manualAdditionSheet = workBook.getWorksheet("Manual Addition");
            const [courseInfoRowObjs, courseInfoValidationObjs] = this.extractRowObjects(courseInfoSheet);
            const [manualAdditionRowObjs, manualValidationObjs] = this.extractRowObjects(manualAdditionSheet, fiscalYear);
            return [
                courseInfoRowObjs,
                courseInfoValidationObjs,
                manualAdditionRowObjs,
                manualValidationObjs,
            ];
        });
        return [
            courseInfoRowObjects,
            courseInfoValidationObjects,
            manualAdditionRowObjects,
            manualValidationObjects,
        ];
    }
    async parseManualAddExcel(file, fy) {
        const workBook = new exceljs_1.Workbook();
        const manualAdditionRowObjects = await workBook.xlsx
            .load(file.buffer)
            .then(() => {
            const manualAdditionSheet = workBook.getWorksheet("Manual Addition");
            const manualAdditionRowObjs = this.extractRowObjects(manualAdditionSheet, fy);
            return manualAdditionRowObjs;
        });
        return manualAdditionRowObjects;
    }
    extractRowObjects(sheet, fiscalYear = "") {
        const headerMap = new Map();
        const rowObjs = [];
        let isCourseInfo = false;
        const rowValidation = new Map();
        sheet.eachRow((row, rowNumber) => {
            const filledCols = new Set();
            if (rowNumber === 1) {
                row.eachCell((cell, cellNum) => {
                    headerMap.set(cellNum, cell.value);
                    if (cell.value == "Programme") {
                        isCourseInfo = true;
                    }
                });
            }
            else {
                const rowObj = new Map();
                row.eachCell((cell, cellNum) => {
                    const headerField = headerMap.get(cellNum);
                    if (headerField in fieldMapping) {
                        let cellValue = cell.value;
                        if (typeof cellValue === "string") {
                            cellValue = cellValue.trim();
                        }
                        if ((headerField == "Start Date" || headerField == "Dates") &&
                            this.fiscalYearCheck(cellValue, fiscalYear)) {
                            rowValidation.set(rowNumber, "All or some of the dates provided are out of the fiscal year.");
                        }
                        rowObj.set(fieldMapping[headerField], cellValue);
                        filledCols.add(cellNum);
                    }
                });
                if (isCourseInfo && rowObj.get(fieldMapping.Programme) == undefined) {
                    rowObj.set(fieldMapping.Programme, rowObj.get(fieldMapping["Course Title"]));
                }
                const validationMsg = this.mandatoryColsCheck(isCourseInfo, filledCols);
                if (validationMsg != "") {
                    if (rowValidation.get(rowNumber) == undefined) {
                        rowValidation.set(rowNumber, validationMsg);
                    }
                    else {
                        const existingValidation = rowValidation.get(rowNumber);
                        rowValidation.set(rowNumber, existingValidation + " " + validationMsg);
                    }
                }
                rowObjs.push(rowObj);
            }
        });
        return [rowObjs, rowValidation];
    }
    mandatoryColsCheck(isCourseInfo, filledCols) {
        const mandatoryCols = isCourseInfo
            ? [2, 3, 4, 5, 6, 9, 10, 11]
            : [1];
        const missingCellsArr = [];
        mandatoryCols.forEach((mandatoryCol) => {
            if (!filledCols.has(mandatoryCol)) {
                missingCellsArr.push(mandatoryCol);
            }
        });
        if (missingCellsArr.length != 0) {
            return `Column(s) ${missingCellsArr.join(", ")} must be filled up.`;
        }
        return "";
    }
    fiscalYearCheck(cellValue, fiscalYear) {
        const inputYears = cellValue.toString().split(",");
        const fiscalYearArr = fiscalYear.split("-");
        const fiscalYearStartDate = new Date(`${fiscalYearArr[0]}-04-01`);
        const fiscalYearEndDate = new Date(`${fiscalYearArr[1]}-03-31`);
        for (let i = 0; i < inputYears.length; i++) {
            const dateToCheck = new Date(inputYears[i]);
            if (dateToCheck < fiscalYearStartDate ||
                dateToCheck > fiscalYearEndDate) {
                return true;
            }
        }
        return false;
    }
};
DataIngestionService = __decorate([
    (0, common_1.Injectable)()
], DataIngestionService);
exports.DataIngestionService = DataIngestionService;
//# sourceMappingURL=data-ingestion.service.js.map