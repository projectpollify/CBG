import { InvoiceLineItem, TaxRates } from '../types/invoice';
export declare class InvoiceCalculator {
    static calculateLineItemTotal(quantity: number, unitPrice: number): number;
    static calculateSubtotal(lineItems: InvoiceLineItem[]): number;
    static calculateGST(subtotal: number, gstRate: number): number;
    static calculatePST(subtotal: number, pstRate: number): number;
    static calculateTotal(subtotal: number, gstAmount: number, pstAmount: number): number;
    static calculateInvoiceTotals(lineItems: InvoiceLineItem[], taxRates: TaxRates): {
        subtotal: number;
        gstAmount: number;
        pstAmount: number;
        total: number;
    };
    static formatCurrency(amount: number): string;
    static formatInvoiceNumber(number: number, prefix?: string, suffix?: string): string;
    static calculateDueDate(invoiceDate: Date, paymentTermsDays: number): Date;
    static isOverdue(dueDate: Date, currentDate?: Date): boolean;
    static getDaysOverdue(dueDate: Date, currentDate?: Date): number;
}
//# sourceMappingURL=invoiceCalculations.d.ts.map