import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const BACKEND = process.env.BACKEND_URL || "http://localhost:3001";
  console.log("---------BACKEND---------",BACKEND);

  const body = await req.json();
  console.log("Login Request Body:", JSON.stringify(body));

  try {
    const res = await fetch(`${BACKEND}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    console.log("----ee-----------auth/login------",`${BACKEND}/auth/login`);
    console.log("----ee-----------body-------",body);
    
    const data = await res.json();
    console.log("Backend Login Response Data:", JSON.stringify(data));

    if (!res.ok) return NextResponse.json(data, { status: res.status });

    const token = data?.data?.token;
    const userId = data?.data?.user?.id;
    
    console.log("Extracted Token:", token ? "Token exists (length: " + token.length + ")" : "Token is MISSING");
    console.log("Extracted UserID:", userId);

    const response = NextResponse.json(data);
    
    // FIXED: 24 HOURS EXPIRY + BROWSER CLOSE SAFE
    // NOTE: secure is true in production for HTTPS
    if (token) {
      console.log("Setting token cookie...");
      response.cookies.set("token", token, {
        httpOnly: false,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 600 * 60 * 60,           // 24 hours
        expires: new Date(Date.now() + 600 * 60 * 60 * 1000),  // 24 hours
      });
    } else {
        console.log("Skipping token cookie setting because token is missing");
    }
    
    if (userId) {
      response.cookies.set("id", String(userId), {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 600 * 60 * 60,           // 24 hours
        expires: new Date(Date.now() + 600 * 60 * 60 * 1000),  // 24 hours
      });
    }

    return response;
  } catch (err) {
    console.error("Login Route Error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
