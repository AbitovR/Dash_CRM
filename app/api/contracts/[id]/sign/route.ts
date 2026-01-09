import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, generateContractEmailHTML, generateContractSignedNotificationHTML } from "@/lib/email";
import { verifySigningToken } from "@/lib/security";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signature, signatureType, signedByName, token } = body;

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Verify token if provided (for public signing)
    if (token) {
      const isAuthorized = verifySigningToken(contract.signingToken, token);
      if (!isAuthorized) {
        return NextResponse.json(
          { error: "Invalid or expired signing token" },
          { status: 401 }
        );
      }
    }

    if (contract.status === "signed") {
      return NextResponse.json(
        { error: "Contract already signed" },
        { status: 400 }
      );
    }

    // Save signature data
    // In production, you might want to:
    // 1. Upload signature image to cloud storage (S3, Cloudinary, etc.)
    // 2. Generate PDF with signature embedded
    // 3. Store signature URL in database

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        status: "signed",
        signedAt: new Date(),
        signedBy: signedByName || `${contract.customer.firstName} ${contract.customer.lastName}`,
        signatureUrl: signatureType === "draw" ? signature : null, // Store signature data URL or uploaded URL
      },
      include: {
        customer: true,
      },
    });

    // Send confirmation email to customer
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    // Use the public signing route with token for security - customers should NOT access admin dashboard
    const signingToken = contract.signingToken;
    if (!signingToken) {
      console.error("Contract missing signing token, cannot generate secure view URL");
    }
    const contractUrl = signingToken 
      ? `${appUrl}/sign/${id}?token=${signingToken}`
      : `${appUrl}/sign/${id}`; // Fallback if token missing (shouldn't happen)
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Contract Signed</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p>Dear ${contract.customer.firstName} ${contract.customer.lastName},</p>
          <p>Thank you for signing the contract <strong>${contract.contractNumber}</strong>.</p>
          <p>Your contract has been successfully signed and is now active.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${contractUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Contract
            </a>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            Note: This link provides secure, read-only access to your contract. You will not have access to the admin dashboard.
          </p>
          <p>Best regards,<br><strong>Caravan Transport LLC</strong></p>
        </div>
      </body>
      </html>
    `;

    // Send confirmation to customer
    await sendEmail({
      to: contract.customer.email,
      subject: `Contract ${contract.contractNumber} - Signed Successfully`,
      html: emailHtml,
    });

    // Send notification to admin
    try {
      const signerName = signedByName || `${contract.customer.firstName} ${contract.customer.lastName}`;
      const notificationHtml = generateContractSignedNotificationHTML(
        contract.contractNumber,
        contract.title,
        `${contract.customer.firstName} ${contract.customer.lastName}`,
        contract.customer.email,
        new Date(),
        signedByName
      );

      await sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL || "support@caravantransport.io",
        subject: `✅ Contract ${contract.contractNumber} Signed by ${signerName}`,
        html: notificationHtml,
      });
    } catch (error) {
      console.error("Error sending contract signed notification:", error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(updatedContract);
  } catch (error: any) {
    console.error("Error signing contract:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign contract" },
      { status: 500 }
    );
  }
}

