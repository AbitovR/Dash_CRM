import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ userCount });
  } catch (error) {
    console.error("Error checking users:", error);
    return NextResponse.json({ userCount: 1 }, { status: 500 });
  }
}

