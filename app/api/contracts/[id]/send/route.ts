import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendEmail, generateContractEmailHTML } from "@/lib/email";
import { generateSigningToken } from "@/lib/security";
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

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file." },
        { status: 500 }
      );
    }

    // Determine amount to charge online based on payment method
    let amountToChargeOnline = 0;
    if (contract.paymentMethod === "credit_card") {
      amountToChargeOnline = contract.totalAmount;
    } else if (contract.paymentMethod === "split") {
      amountToChargeOnline = contract.amountPaidOnline || 0;
    } else if (contract.paymentMethod === "cod") {
      amountToChargeOnline = 0; // No online payment for COD
    }

    let paymentLink: any = null;
    
    // Only create Stripe payment link if there's an amount to charge online
    if (amountToChargeOnline > 0) {
      // First create a Price object
      const price = await stripe.prices.create({
        currency: contract.currency.toLowerCase(),
        unit_amount: Math.round(amountToChargeOnline * 100),
        product_data: {
          name: contract.title,
        },
      });

      // Create Stripe Payment Link with the price
      paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          contractId: contract.id,
          customerId: contract.customerId,
        },
      });
    }

    // Generate secure signing token if not exists
    const signingToken = contract.signingToken || generateSigningToken();

    // Update contract with payment link and signing token
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        status: "sent",
        stripePaymentLinkId: paymentLink?.id || null,
        stripePaymentLinkUrl: paymentLink?.url || null,
        signingToken: signingToken,
      },
    });

    // Generate secure signing URL with token
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signUrl = `${appUrl}/sign/${id}?token=${signingToken}`;
    const pdfUrl = `${appUrl}/api/contracts/${id}/pdf?token=${signingToken}`;

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

    // Send email to customer
    const emailHtml = generateContractEmailHTML(
      `${contract.customer.firstName} ${contract.customer.lastName}`,
      contract.contractNumber,
      contract.title,
      contract.totalAmount,
      contract.currency,
      signUrl,
      paymentLink?.url,
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
    console.log("Email sending result:", {
      success: emailResult.success,
      error: emailResult.error,
      to: contract.customer.email,
    });

    // In a real application, you would also:
    // 1. Generate a PDF contract
    // 2. Attach PDF to email
    // 3. Integrate with e-signature service (DocuSign, HelloSign, etc.) if needed

    return NextResponse.json({
      ...updatedContract,
      paymentLink: paymentLink?.url || null,
      signUrl: signUrl,
      emailSent: emailResult.success,
      emailError: emailResult.error,
      message: emailResult.success 
        ? `Contract sent successfully. ${paymentLink ? "Payment link created and " : ""}Email sent to customer.`
        : `Contract sent successfully. ${paymentLink ? "Payment link created, but " : ""}Email failed to send. Please check SendGrid configuration.`,
    });
  } catch (error: any) {
    console.error("Error sending contract:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to send contract";
    
    if (error.message?.includes("Stripe")) {
      errorMessage = "Stripe API error. Please check your Stripe API keys.";
    } else if (error.message?.includes("email") || error.message?.includes("SendGrid")) {
      errorMessage = "Email sending failed, but contract was created. Please check SendGrid configuration.";
    } else if (error.message?.includes("database") || error.message?.includes("Prisma")) {
      errorMessage = "Database error. Please check your database connection.";
    } else {
      errorMessage = error.message || "Failed to send contract";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

