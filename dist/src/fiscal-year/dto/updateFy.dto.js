"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const createFy_dto_1 = require("./createFy.dto");
class UpdateFyDto extends (0, swagger_1.PartialType)(createFy_dto_1.CreateFyDto) {
    constructor({ fy = "", day_limit = 0, blackout_dates = null, low_manpower_dates = null, }) {
        super(fy, day_limit, blackout_dates, low_manpower_dates);
    }
}
exports.UpdateFyDto = UpdateFyDto;
//# sourceMappingURL=updateFy.dto.js.map