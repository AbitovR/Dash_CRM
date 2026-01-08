import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY is not set. Email functionality will be disabled.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("Email not sent (SendGrid not configured):", options);
    return { success: false, message: "SendGrid not configured" };
  }

  try {
    const msg: any = {
      to: options.to,
      from: options.from || process.env.SENDGRID_FROM_EMAIL || "noreply@caravantransport.com",
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
      html: options.html,
    };

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      msg.attachments = options.attachments.map((att) => ({
        content: att.content,
        filename: att.filename,
        type: att.type,
        disposition: att.disposition,
      }));
    }

    await sgMail.send(msg);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email:", error);
    
    // Provide more detailed error information
    let errorMessage = error.message || "Unknown error";
    
    if (error.response) {
      // SendGrid API error response
      const { body, statusCode } = error.response;
      console.error("SendGrid API Error:", {
        statusCode,
        body,
        errors: body?.errors,
      });
      
      if (body?.errors && body.errors.length > 0) {
        errorMessage = body.errors.map((e: any) => e.message).join(", ");
      } else {
        errorMessage = `SendGrid API Error (${statusCode}): ${JSON.stringify(body)}`;
      }
    }
    
    return { success: false, error: errorMessage, details: error.response?.body };
  }
}

export function generateContractEmailHTML(
  customerName: string,
  contractNumber: string,
  contractTitle: string,
  amount: number,
  currency: string,
  signUrl: string,
  paymentLink?: string,
  pdfUrl?: string,
  paymentMethod?: string,
  amountPaidOnline?: number | null,
  amountPaidCOD?: number | null
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contract for Signature</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Caravan Transport</h1>
        <p style="color: white; margin: 10px 0 0 0;">Contract for Signature</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <p>Dear ${customerName},</p>
        
        <p>We are pleased to present you with a contract for your vehicle transportation services.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h2 style="margin-top: 0; color: #667eea;">Contract Details</h2>
          <p><strong>Contract Number:</strong> ${contractNumber}</p>
          <p><strong>Title:</strong> ${contractTitle}</p>
          <p><strong>Total Amount:</strong> ${currency} $${amount.toFixed(2)}</p>
          ${paymentMethod === "cod" ? `
          <p style="color: #856404; background: #fff3cd; padding: 10px; border-radius: 4px; margin-top: 10px;">
            <strong>Payment Method:</strong> Cash on Delivery (COD)<br>
            You will pay $${amount.toFixed(2)} in cash to the driver upon delivery.
          </p>
          ` : paymentMethod === "split" ? `
          <p style="color: #004085; background: #cce5ff; padding: 10px; border-radius: 4px; margin-top: 10px;">
            <strong>Payment Method:</strong> Split Payment<br>
            Online Payment: ${currency} $${(amountPaidOnline || 0).toFixed(2)}<br>
            Cash on Delivery: ${currency} $${(amountPaidCOD || 0).toFixed(2)}
          </p>
          ` : `
          <p><strong>Payment Method:</strong> Credit Card (Full Payment Online)</p>
          `}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${signUrl}" 
             style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 10px;">
            Review & Sign Contract
          </a>
        </div>
        
        ${pdfUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <p style="margin-bottom: 10px;"><strong>Download Contract PDF:</strong></p>
          <a href="${pdfUrl}" 
             style="background: #6c757d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Download PDF
          </a>
        </div>
        ` : ""}
        
        ${paymentLink && paymentMethod !== "cod" ? `
        <div style="text-align: center; margin: 20px 0;">
          <p style="margin-bottom: 10px;"><strong>${paymentMethod === "split" ? "Make online payment:" : "Make payment:"}</strong></p>
          <a href="${paymentLink}" 
             style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Pay ${paymentMethod === "split" && amountPaidOnline ? `$${amountPaidOnline.toFixed(2)}` : "Now"}
          </a>
        </div>
        ` : paymentMethod === "cod" ? `
        <div style="text-align: center; margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 5px;">
          <p style="margin: 0; color: #856404;"><strong>Payment will be collected in cash upon delivery.</strong></p>
        </div>
        ` : ""}
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Please review the contract terms carefully. By signing, you agree to all terms and conditions outlined in the agreement.
        </p>
        
        <p style="margin-top: 20px;">
          If you have any questions, please don't hesitate to contact us.
        </p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>Caravan Transport LLC</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; ${new Date().getFullYear()} Caravan Transport LLC. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

export function generateContractOpenedNotificationHTML(
  contractNumber: string,
  contractTitle: string,
  customerName: string,
  customerEmail: string,
  openedAt: Date
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contract Opened Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Contract Opened</h1>
        <p style="color: white; margin: 10px 0 0 0;">Customer has viewed the contract</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <p>Hello,</p>
        
        <p>The customer has opened and viewed the contract.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h2 style="margin-top: 0; color: #667eea;">Contract Details</h2>
          <p><strong>Contract Number:</strong> ${contractNumber}</p>
          <p><strong>Title:</strong> ${contractTitle}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Customer Email:</strong> ${customerEmail}</p>
          <p><strong>Opened At:</strong> ${openedAt.toLocaleString()}</p>
        </div>
        
        <p style="margin-top: 30px;">
          This is an automated notification from Caravan Transport CRM.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; ${new Date().getFullYear()} Caravan Transport LLC. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

export function generateContractSignedNotificationHTML(
  contractNumber: string,
  contractTitle: string,
  customerName: string,
  customerEmail: string,
  signedAt: Date,
  signedBy: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contract Signed Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Contract Signed</h1>
        <p style="color: white; margin: 10px 0 0 0;">Customer has signed the contract</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <p>Hello,</p>
        
        <p>The customer has successfully signed the contract.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h2 style="margin-top: 0; color: #28a745;">Contract Details</h2>
          <p><strong>Contract Number:</strong> ${contractNumber}</p>
          <p><strong>Title:</strong> ${contractTitle}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Customer Email:</strong> ${customerEmail}</p>
          <p><strong>Signed By:</strong> ${signedBy}</p>
          <p><strong>Signed At:</strong> ${signedAt.toLocaleString()}</p>
        </div>
        
        <p style="margin-top: 30px;">
          The contract is now active and ready for processing.
        </p>
        
        <p style="margin-top: 20px;">
          This is an automated notification from Caravan Transport CRM.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; ${new Date().getFullYear()} Caravan Transport LLC. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

export function generatePaymentConfirmationHTML(
  customerName: string,
  amount: number,
  currency: string,
  paymentId: string,
  contractNumber?: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Payment Received</h1>
        <p style="color: white; margin: 10px 0 0 0;">Thank you for your payment</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <p>Dear ${customerName},</p>
        
        <p>We have successfully received your payment.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h2 style="margin-top: 0; color: #28a745;">Payment Details</h2>
          <p><strong>Amount:</strong> ${currency} $${amount.toFixed(2)}</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          ${contractNumber ? `<p><strong>Contract Number:</strong> ${contractNumber}</p>` : ""}
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p style="margin-top: 30px;">
          Your payment has been processed and your account has been updated accordingly.
        </p>
        
        <p style="margin-top: 20px;">
          If you have any questions about this payment, please contact us.
        </p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>Caravan Transport LLC</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; ${new Date().getFullYear()} Caravan Transport LLC. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

