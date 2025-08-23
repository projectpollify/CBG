"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOMER_STATUS_OPTIONS = exports.BC_REGIONS = exports.CustomerStatus = void 0;
// Customer status enum
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["ACTIVE"] = "ACTIVE";
    CustomerStatus["INACTIVE"] = "INACTIVE";
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
// Common BC regions for dropdown
exports.BC_REGIONS = [
    'Vancouver',
    'North Vancouver',
    'West Vancouver',
    'Burnaby',
    'Richmond',
    'Surrey',
    'Langley',
    'Coquitlam',
    'Port Coquitlam',
    'New Westminster',
    'Delta',
    'White Rock',
    'Maple Ridge',
    'Port Moody',
    'Abbotsford',
    'Chilliwack',
    'Mission',
    'Victoria',
    'Nanaimo',
    'Kelowna',
    'Kamloops',
    'Vernon',
    'Whistler',
    'Squamish',
    'Lower Mainland',
    'Other'
];
// Customer status options for forms
exports.CUSTOMER_STATUS_OPTIONS = [
    { value: CustomerStatus.ACTIVE, label: 'Active' },
    { value: CustomerStatus.INACTIVE, label: 'Inactive' }
];
//# sourceMappingURL=customer.js.map