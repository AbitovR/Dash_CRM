import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContractPDF } from "@/lib/pdfGenerator";
import { verifySigningToken } from "@/lib/security";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Verify token if provided (for public access)
    if (token) {
      const isAuthorized = verifySigningToken(contract.signingToken, token);
      if (!isAuthorized) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }
    }

    // Generate PDF
    const pdfBuffer = await generateContractPDF({
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

    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contract-${contract.contractNumber}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

