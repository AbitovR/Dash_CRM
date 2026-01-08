import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const customer = await prisma.customer.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zipCode: body.zipCode || null,
        country: body.country || null,
        vehicleMake: body.vehicleMake || null,
        vehicleModel: body.vehicleModel || null,
        vehicleYear: body.vehicleYear || null,
        vehicleVIN: body.vehicleVIN || null,
        vehicleType: body.vehicleType || null,
        pickupLocation: body.pickupLocation || null,
        deliveryLocation: body.deliveryLocation || null,
        preferredDate: body.preferredDate ? new Date(body.preferredDate) : null,
        specialNotes: body.specialNotes || null,
      },
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error("Error creating customer:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

