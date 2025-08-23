"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsCategory = exports.AppointmentStatus = exports.UserRole = void 0;
// Re-export all customer types
__exportStar(require("./types/customer"), exports);
// Re-export all invoice types
__exportStar(require("./types/invoice"), exports);
// Re-export all auth types
__exportStar(require("./types/auth"), exports);
// Re-export invoice utilities
__exportStar(require("./utils/invoiceCalculations"), exports);
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["FRANCHISEE"] = "FRANCHISEE";
    UserRole["EMPLOYEE"] = "EMPLOYEE";
})(UserRole || (exports.UserRole = UserRole = {}));
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["SCHEDULED"] = "SCHEDULED";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var SettingsCategory;
(function (SettingsCategory) {
    SettingsCategory["BUSINESS"] = "BUSINESS";
    SettingsCategory["INVOICE"] = "INVOICE";
    SettingsCategory["EMAIL"] = "EMAIL";
    SettingsCategory["SYSTEM"] = "SYSTEM";
})(SettingsCategory || (exports.SettingsCategory = SettingsCategory = {}));
//# sourceMappingURL=index.js.map