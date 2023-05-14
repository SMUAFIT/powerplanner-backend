"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLogger = void 0;
const common_1 = require("@nestjs/common");
let CustomLogger = class CustomLogger extends common_1.ConsoleLogger {
    success(data) {
        if (typeof data !== 'undefined') {
            this.log(Object.assign({ response: '200', results: 'No problems' }, data));
        }
        else {
            this.log({
                response: '200',
                results: 'No problems',
            });
        }
    }
    successCreate(data) {
        if (typeof data !== 'undefined') {
            this.log(Object.assign({ response: '201', results: 'Successfully created' }, data));
        }
        else {
            this.log({
                response: '201',
                results: 'Successfully created',
            });
        }
    }
};
CustomLogger = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT })
], CustomLogger);
exports.CustomLogger = CustomLogger;
//# sourceMappingURL=customLogger.js.map