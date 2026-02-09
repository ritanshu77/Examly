import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const BACKEND = process.env.BACKEND_URL || "http://localhost:3001";
  try {
    const body = await req.json();
    const token = body?.token;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "token required" }, 
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const newToken = data?.data?.token;
    const response = NextResponse.json(data);
    
    // FIXED: 24 HOURS EXPIRY (same as login)
    // NOTE: secure is true in production for HTTPS
    if (newToken) {
      response.cookies.set("token", newToken, {
        httpOnly: false,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 600 * 60 * 60,           // 24 hours
        expires: new Date(Date.now() + 600 * 60 * 60 * 1000),  // 24 hours
      });
    }

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) }, 
      { status: 500 }
    );
  }
}
