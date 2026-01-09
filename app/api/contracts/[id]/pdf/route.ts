import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContractPDF } from "@/lib/pdfGenerator";
import { verifySigningToken } from "@/lib/security";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    // Check authentication - either token (public) or session (admin)
    const session = await getSession();
    const hasToken = !!token;
    const hasSession = !!session;

    if (!hasToken && !hasSession) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid token or sign in." },
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
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Verify token if provided (for public access)
    if (token) {
      if (!contract.signingToken) {
        return NextResponse.json(
          { error: "Contract does not have a signing token" },
          { status: 401 }
        );
      }
      const isAuthorized = verifySigningToken(contract.signingToken, token);
      if (!isAuthorized) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }
    }

    // Generate PDF
    console.log("Generating PDF for contract:", contract.contractNumber);
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

    console.log("PDF generated successfully, size:", pdfBuffer.length, "bytes");

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
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: error.message || "Failed to generate PDF",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

