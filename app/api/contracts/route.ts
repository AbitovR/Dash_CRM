import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate contract number
    const contractCount = await prisma.contract.count();
    const contractNumber = `CT-${String(contractCount + 1).padStart(6, "0")}`;

    const contract = await prisma.contract.create({
      data: {
        customerId: body.customerId,
        contractNumber,
        title: body.title,
        description: body.description || null,
        totalAmount: body.totalAmount,
        depositAmount: body.depositAmount || null,
        currency: body.currency || "USD",
        paymentMethod: body.paymentMethod || "credit_card",
        transportAmount: body.transportAmount || null,
        brokerFeeAmount: body.brokerFeeAmount || null,
        amountPaidOnline: body.amountPaidOnline || null,
        amountPaidCOD: body.amountPaidCOD || null,
        pickupDate: body.pickupDate ? new Date(body.pickupDate) : null,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
        estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : null,
        status: "draft",
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}

