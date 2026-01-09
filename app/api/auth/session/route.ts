import { NextRequest, NextResponse } from "next/server";
import { setSession, clearSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await request.json();
    await setSession(session);
    
    const response = NextResponse.json({ success: true });
    
    // Also set cookie in response for client-side access
    response.cookies.set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to set session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearSession();
    
    const response = NextResponse.json({ success: true });
    response.cookies.delete("session");
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clear session" },
      { status: 500 }
    );
  }
}

