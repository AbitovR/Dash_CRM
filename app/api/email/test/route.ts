import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generateContractEmailHTML } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, testType = "contract" } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { 
          error: "SendGrid not configured",
          message: "Please add SENDGRID_API_KEY to your .env file"
        },
        { status: 400 }
      );
    }

    let emailHtml: string;
    let subject: string;

    if (testType === "contract") {
      subject = "Test Email - Contract for Signature";
      emailHtml = generateContractEmailHTML(
        "Test Customer",
        "CT-000001",
        "Test Car Shipping Agreement",
        5000,
        "USD",
        "http://localhost:3000/contracts/test/sign",
        "https://buy.stripe.com/test"
      );
    } else {
      subject = "Test Email from Caravan CRM";
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email from Caravan Transport CRM.</p>
          <p>If you received this, SendGrid is configured correctly! ✅</p>
        </body>
        </html>
      `;
    }

    const result = await sendEmail({
      to,
      subject,
      html: emailHtml,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully!",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email", details: result },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test email" },
      { status: 500 }
    );
  }
}

