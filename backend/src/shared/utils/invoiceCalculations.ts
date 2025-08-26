import { InvoiceLineItem, TaxRates } from '../types/invoice';

export class InvoiceCalculator {
  static calculateLineItemTotal(quantity: number, unitPrice: number): number {
    return Math.round(quantity * unitPrice * 100) / 100;
  }

  static calculateSubtotal(lineItems: InvoiceLineItem[]): number {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + this.calculateLineItemTotal(item.quantity, item.unitPrice);
    }, 0);
    return Math.round(subtotal * 100) / 100;
  }

  static calculateGST(subtotal: number, gstRate: number): number {
    return Math.round(subtotal * gstRate * 100) / 100;
  }

  static calculatePST(subtotal: number, pstRate: number): number {
    return Math.round(subtotal * pstRate * 100) / 100;
  }

  static calculateTotal(subtotal: number, gstAmount: number, pstAmount: number): number {
    return Math.round((subtotal + gstAmount + pstAmount) * 100) / 100;
  }

  static calculateInvoiceTotals(lineItems: InvoiceLineItem[], taxRates: TaxRates) {
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

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  }

  static formatInvoiceNumber(number: number, prefix?: string, suffix?: string): string {
    let formatted = number.toString().padStart(5, '0');
    if (prefix) formatted = prefix + formatted;
    if (suffix) formatted = formatted + suffix;
    return formatted;
  }

  static calculateDueDate(invoiceDate: Date, paymentTermsDays: number): Date {
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);
    return dueDate;
  }

  static isOverdue(dueDate: Date, currentDate: Date = new Date()): boolean {
    return currentDate > dueDate;
  }

  static getDaysOverdue(dueDate: Date, currentDate: Date = new Date()): number {
    if (!this.isOverdue(dueDate, currentDate)) return 0;
    const diffTime = Math.abs(currentDate.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}