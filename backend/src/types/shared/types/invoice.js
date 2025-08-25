"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_INVOICE_SETTINGS = exports.DEFAULT_TAX_RATES = exports.DEFAULT_COMPANY_INFO = exports.DEFAULT_SERVICE_PRICING = exports.PaymentMethod = exports.ServiceType = exports.InvoiceStatus = void 0;
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["SENT"] = "SENT";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["RESURFACING"] = "RESURFACING";
    ServiceType["NEW_BOARD"] = "NEW_BOARD";
    ServiceType["STAINLESS_INSERT"] = "STAINLESS_INSERT";
    ServiceType["STAINLESS_CLAMPS"] = "STAINLESS_CLAMPS";
    ServiceType["BOARD_MODIFICATIONS"] = "BOARD_MODIFICATIONS";
    ServiceType["SPECIAL"] = "SPECIAL";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CHEQUE"] = "CHEQUE";
    PaymentMethod["E_TRANSFER"] = "E_TRANSFER";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["DEBIT"] = "DEBIT";
    PaymentMethod["OTHER"] = "OTHER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
exports.DEFAULT_SERVICE_PRICING = [
    {
        serviceType: ServiceType.RESURFACING,
        unitPrice: 0.065,
        description: 'Board resurfacing service'
    },
    {
        serviceType: ServiceType.NEW_BOARD,
        unitPrice: 0.10,
        description: 'New cutting board sales'
    },
    {
        serviceType: ServiceType.STAINLESS_INSERT,
        unitPrice: 450.00,
        description: 'Stainless steel insert installation'
    },
    {
        serviceType: ServiceType.STAINLESS_CLAMPS,
        unitPrice: 25.00,
        description: 'Stainless steel clamps'
    },
    {
        serviceType: ServiceType.BOARD_MODIFICATIONS,
        unitPrice: 10.00,
        description: 'Board modifications and customization'
    },
    {
        serviceType: ServiceType.SPECIAL,
        unitPrice: 25.00,
        description: 'Special services'
    }
];
exports.DEFAULT_COMPANY_INFO = {
    name: 'Cutting Board Guys B.C inc.',
    address: '701 West Georgia suite 1400',
    city: 'Vancouver',
    province: 'B.C.',
    postalCode: 'V7Y1C6',
    email: 'info@cuttingboardguys.ca',
    phone: '604 468 8234',
    website: 'cuttingboardguys.ca',
    gstNumber: '756290169RT0001'
};
exports.DEFAULT_TAX_RATES = {
    gst: 0.05,
    pst: 0.07
};
exports.DEFAULT_INVOICE_SETTINGS = {
    nextInvoiceNumber: 10001,
    paymentTermsDays: 30,
    defaultNotes: 'Thank you for your business!',
    emailSubject: 'Invoice #{invoiceNumber} from Cutting Board Guys',
    emailBody: 'Please find attached your invoice. Payment is due within {paymentTerms} days.'
};
//# sourceMappingURL=invoice.js.map