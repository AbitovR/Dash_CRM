import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySigningToken } from "@/lib/security";
import { sendEmail, generateContractOpenedNotificationHTML } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { authorized: false, error: "Token is required" },
        { status: 401 }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { authorized: false, error: "Contract not found" },
        { status: 404 }
      );
    }

    // Verify the token
    const isAuthorized = verifySigningToken(contract.signingToken, token);

    if (!isAuthorized) {
      return NextResponse.json(
        { authorized: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Send notification email to admin if contract hasn't been viewed before
    // (This is a simple check - in production you might want to track viewedAt)
    if (contract.status === "sent" && !contract.signedBy) {
      try {
        const notificationHtml = generateContractOpenedNotificationHTML(
          contract.contractNumber,
          contract.title,
          `${contract.customer.firstName} ${contract.customer.lastName}`,
          contract.customer.email,
          new Date()
        );

        await sendEmail({
          to: process.env.ADMIN_NOTIFICATION_EMAIL || "support@caravantransport.io",
          subject: `Contract ${contract.contractNumber} Opened by Customer`,
          html: notificationHtml,
        });
      } catch (error) {
        console.error("Error sending contract opened notification:", error);
        // Don't fail the request if notification fails
      }
    }

    // Return contract data (without sensitive info)
    return NextResponse.json({
      authorized: true,
      contract: {
        id: contract.id,
        contractNumber: contract.contractNumber,
        title: contract.title,
        description: contract.description,
        totalAmount: contract.totalAmount,
        currency: contract.currency,
        depositAmount: contract.depositAmount,
        paymentMethod: contract.paymentMethod,
        transportAmount: contract.transportAmount,
        brokerFeeAmount: contract.brokerFeeAmount,
        amountPaidOnline: contract.amountPaidOnline,
        amountPaidCOD: contract.amountPaidCOD,
        status: contract.status,
        signedAt: contract.signedAt,
        signedBy: contract.signedBy,
        signatureUrl: contract.signatureUrl,
        stripePaymentLinkUrl: contract.stripePaymentLinkUrl,
        pickupDate: contract.pickupDate,
        deliveryDate: contract.deliveryDate,
        estimatedDelivery: contract.estimatedDelivery,
        customer: {
          firstName: contract.customer.firstName,
          lastName: contract.customer.lastName,
          email: contract.customer.email,
        },
      },
    });
  } catch (error: any) {
    console.error("Error verifying contract access:", error);
    return NextResponse.json(
      { authorized: false, error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}

