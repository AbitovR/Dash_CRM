import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, generateContractEmailHTML } from "@/lib/email";
import { generateContractPDF } from "@/lib/pdfGenerator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    if (!contract.customer) {
      return NextResponse.json(
        { error: "Customer not found for this contract" },
        { status: 404 }
      );
    }

    // Generate secure signing URL with token
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signingToken = contract.signingToken;
    if (!signingToken) {
      return NextResponse.json(
        { error: "Contract does not have a signing token. Please send the contract first." },
        { status: 400 }
      );
    }
    const signUrl = `${appUrl}/sign/${id}?token=${signingToken}`;

    // Generate PDF for email attachment
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await generateContractPDF({
        contractNumber: contract.contractNumber,
        title: contract.title,
        description: contract.description || "",
        totalAmount: contract.totalAmount,
        currency: contract.currency,
        depositAmount: contract.depositAmount,
        paymentMethod: contract.paymentMethod,
        transportAmount: contract.transportAmount,
        brokerFeeAmount: contract.brokerFeeAmount,
        amountPaidOnline: contract.amountPaidOnline,
        amountPaidCOD: contract.amountPaidCOD,
        customerName: `${contract.customer.firstName} ${contract.customer.lastName}`,
        customerEmail: contract.customer.email,
        signedBy: contract.signedBy,
        signedAt: contract.signedAt,
        pickupDate: contract.pickupDate,
        deliveryDate: contract.deliveryDate,
        estimatedDelivery: contract.estimatedDelivery,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Continue without PDF attachment if generation fails
    }

    // Generate email HTML
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pdfUrl = `${appUrl}/api/contracts/${id}/pdf?token=${signingToken}`;
    
    const emailHtml = generateContractEmailHTML(
      `${contract.customer.firstName} ${contract.customer.lastName}`,
      contract.contractNumber,
      contract.title,
      contract.totalAmount,
      contract.currency,
      signUrl,
      contract.stripePaymentLinkUrl || undefined,
      pdfUrl,
      contract.paymentMethod,
      contract.amountPaidOnline,
      contract.amountPaidCOD
    );

    // Send email to customer
    const emailResult = await sendEmail({
      to: contract.customer.email,
      subject: `Contract ${contract.contractNumber} - Please Review and Sign`,
      html: emailHtml,
      attachments: pdfBuffer
        ? [
            {
              content: pdfBuffer.toString("base64"),
              filename: `contract-${contract.contractNumber}.pdf`,
              type: "application/pdf",
              disposition: "attachment",
            },
          ]
        : undefined,
    });

    // Log email result for debugging
    console.log("Resend email result:", {
      success: emailResult.success,
      error: emailResult.error,
      to: contract.customer.email,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "Failed to send email",
          details: emailResult.details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contract email resent successfully",
      emailSent: true,
    });
  } catch (error: any) {
    console.error("Error resending contract email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to resend contract email",
      },
      { status: 500 }
    );
  }
}

