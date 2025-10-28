"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceCalculator = void 0;
class InvoiceCalculator {
    static calculateLineItemTotal(quantity, unitPrice) {
        return Math.round(quantity * unitPrice * 100) / 100;
    }
    static calculateSubtotal(lineItems) {
        const subtotal = lineItems.reduce((sum, item) => {
            return sum + this.calculateLineItemTotal(item.quantity, item.unitPrice);
        }, 0);
        return Math.round(subtotal * 100) / 100;
    }
    static calculateGST(subtotal, gstRate) {
        return Math.round(subtotal * gstRate * 100) / 100;
    }
    static calculatePST(subtotal, pstRate) {
        return Math.round(subtotal * pstRate * 100) / 100;
    }
    static calculateTotal(subtotal, gstAmount, pstAmount) {
        return Math.round((subtotal + gstAmount + pstAmount) * 100) / 100;
    }
    static calculateInvoiceTotals(lineItems, taxRates) {
        const subtotal = this.calculateSubtotal(lineItems);
        const gstAmount = this.calculateGST(subtotal, taxRates.gst);
        const pstAmount = this.calculatePST(subtotal, taxRates.pst);
        const total = this.calculateTotal(subtotal, gstAmount, pstAmount);
        return {
            subtotal,
            gstAmount,
            pstAmount,
            total
        };
    }
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    }
    static formatInvoiceNumber(number, prefix, suffix) {
        let formatted = number.toString().padStart(5, '0');
        if (prefix)
            formatted = prefix + formatted;
        if (suffix)
            formatted = formatted + suffix;
        return formatted;
    }
    static calculateDueDate(invoiceDate, paymentTermsDays) {
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + paymentTermsDays);
        return dueDate;
    }
    static isOverdue(dueDate, currentDate = new Date()) {
        return currentDate > dueDate;
    }
    static getDaysOverdue(dueDate, currentDate = new Date()) {
        if (!this.isOverdue(dueDate, currentDate))
            return 0;
        const diffTime = Math.abs(currentDate.getTime() - dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
}
exports.InvoiceCalculator = InvoiceCalculator;
//# sourceMappingURL=invoiceCalculations.js.map