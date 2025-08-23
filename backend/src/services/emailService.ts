import { Invoice, CompanyInfo, InvoiceLineItem } from 'cbg-shared';
import { SettingsService } from './settingsService';

export class EmailService {
  static generateInvoiceEmailHTML(
    invoice: Invoice,
    companyInfo: CompanyInfo
  ): string {
    const lineItems = invoice.lineItems as any as InvoiceLineItem[];
    
    const lineItemsHTML = lineItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${item.unitPrice.toFixed(3)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    const formatDate = (date: Date | string) => {
      return new Date(date).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${invoice.invoiceNumber.toString().padStart(5, '0')}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 800px; margin: 0 auto; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #003F7F 0%, #002a55 100%); color: white; padding: 40px 30px;">
      <table width="100%">
        <tr>
          <td>
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">${companyInfo.name}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">Professional Cutting Board Services</p>
          </td>
          <td style="text-align: right;">
            <div style="background-color: #FF6B35; display: inline-block; padding: 10px 20px; border-radius: 5px;">
              <h2 style="margin: 0; font-size: 24px;">INVOICE</h2>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Invoice Info -->
    <div style="padding: 30px;">
      <table width="100%" style="margin-bottom: 30px;">
        <tr>
          <td style="width: 50%;">
            <h3 style="color: #003F7F; margin: 0 0 15px 0; font-size: 18px;">From:</h3>
            <div style="color: #333; line-height: 1.6;">
              <strong>${companyInfo.name}</strong><br>
              ${companyInfo.address}<br>
              ${companyInfo.city}, ${companyInfo.province} ${companyInfo.postalCode}<br>
              Email: ${companyInfo.email}<br>
              Phone: ${companyInfo.phone}<br>
              GST #: ${companyInfo.gstNumber}
            </div>
          </td>
          <td style="width: 50%; text-align: right;">
            <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; display: inline-block;">
              <table>
                <tr>
                  <td style="padding: 5px 10px; text-align: left;"><strong>Invoice #:</strong></td>
                  <td style="padding: 5px 10px;">${invoice.invoiceNumber.toString().padStart(5, '0')}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 10px; text-align: left;"><strong>Date:</strong></td>
                  <td style="padding: 5px 10px;">${formatDate(invoice.invoiceDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 10px; text-align: left;"><strong>Due Date:</strong></td>
                  <td style="padding: 5px 10px;">${formatDate(invoice.dueDate)}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>

      <!-- Bill To -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #003F7F; margin: 0 0 15px 0; font-size: 18px;">Bill To:</h3>
        <div style="color: #333; line-height: 1.6; background-color: #f8f8f8; padding: 15px; border-radius: 5px;">
          <strong>${invoice.customer?.businessName}</strong><br>
          ${invoice.customer?.contactName}<br>
          ${invoice.customer?.street}<br>
          ${invoice.customer?.city}, ${invoice.customer?.province} ${invoice.customer?.postalCode}<br>
          ${invoice.customer?.email}<br>
          ${invoice.customer?.phone}
        </div>
      </div>

      <!-- Line Items -->
      <table width="100%" style="border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #003F7F; color: white;">
            <th style="padding: 12px; text-align: left;">Description</th>
            <th style="padding: 12px; text-align: center;">Quantity</th>
            <th style="padding: 12px; text-align: right;">Rate</th>
            <th style="padding: 12px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHTML}
        </tbody>
      </table>

      <!-- Totals -->
      <table width="100%" style="margin-bottom: 30px;">
        <tr>
          <td style="width: 60%;"></td>
          <td style="width: 40%;">
            <table width="100%">
              <tr>
                <td style="padding: 8px; text-align: right;">Subtotal:</td>
                <td style="padding: 8px; text-align: right; font-weight: 500;">$${parseFloat(invoice.subtotal.toString()).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; text-align: right;">GST (5%):</td>
                <td style="padding: 8px; text-align: right; font-weight: 500;">$${parseFloat(invoice.gstAmount.toString()).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; text-align: right;">PST (7%):</td>
                <td style="padding: 8px; text-align: right; font-weight: 500;">$${parseFloat(invoice.pstAmount.toString()).toFixed(2)}</td>
              </tr>
              <tr style="border-top: 2px solid #003F7F;">
                <td style="padding: 12px 8px; text-align: right; font-size: 18px; font-weight: bold; color: #003F7F;">Total:</td>
                <td style="padding: 12px 8px; text-align: right; font-size: 18px; font-weight: bold; color: #003F7F;">$${parseFloat(invoice.total.toString()).toFixed(2)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Notes -->
      ${invoice.notes ? `
      <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 30px;">
        <h4 style="color: #003F7F; margin: 0 0 10px 0;">Notes:</h4>
        <p style="margin: 0; color: #333; line-height: 1.6;">${invoice.notes}</p>
      </div>
      ` : ''}

      <!-- Payment Status -->
      ${invoice.status === 'PAID' ? `
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; text-align: center;">
        <strong style="color: #155724;">✓ Payment Received - Thank You!</strong>
      </div>
      ` : `
      <div style="background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 5px; text-align: center;">
        <strong style="color: #856404;">Payment Due by ${formatDate(invoice.dueDate)}</strong>
      </div>
      `}
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
        Thank you for your business!
      </p>
      <p style="margin: 0; color: #999; font-size: 12px;">
        ${companyInfo.website} | ${companyInfo.email} | ${companyInfo.phone}
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  static async sendInvoiceEmail(
    invoiceId: string,
    to: string,
    cc?: string[],
    bcc?: string[],
    customSubject?: string,
    customMessage?: string
  ): Promise<{ success: boolean; message: string }> {
    // Note: In a production environment, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - SMTP server
    
    // For now, we'll simulate email sending
    console.log(`Sending invoice ${invoiceId} to ${to}`);
    console.log('CC:', cc);
    console.log('BCC:', bcc);
    console.log('Subject:', customSubject);
    console.log('Message:', customMessage);

    // Simulate async email sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: `Invoice email would be sent to ${to}. Note: Email service integration required for production.`
    };
  }

  static generateEmailSubject(invoiceNumber: number, template?: string): string {
    const defaultTemplate = 'Invoice #{invoiceNumber} from Cutting Board Guys';
    const finalTemplate = template || defaultTemplate;
    return finalTemplate.replace('{invoiceNumber}', invoiceNumber.toString().padStart(5, '0'));
  }

  static generateEmailBody(paymentTerms: number, template?: string): string {
    const defaultTemplate = `Dear Customer,

Please find attached your invoice from Cutting Board Guys.

Payment is due within {paymentTerms} days.

If you have any questions about this invoice, please don't hesitate to contact us.

Thank you for your business!

Best regards,
The Cutting Board Guys Team`;

    const finalTemplate = template || defaultTemplate;
    return finalTemplate.replace('{paymentTerms}', paymentTerms.toString());
  }

  static async trackEmailDelivery(
    invoiceId: string,
    status: 'sent' | 'delivered' | 'opened' | 'bounced'
  ): Promise<void> {
    // In production, this would update the database with email tracking information
    console.log(`Email for invoice ${invoiceId} status: ${status}`);
  }
}