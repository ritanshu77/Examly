import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "No token found" }, { status: 401 });
  }

  try {
    const backend = process.env.BACKEND_URL || "http://localhost:3001";
    const res = await fetch(`${backend}/auth/validate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    if (!res.ok) {
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const data = await res.json();
    // Normalize user data structure
    const user = data?.data?.user ?? data?.user ?? data?.data?.data?.user;
    
    if (!user) {
        return NextResponse.json({ success: false, message: "User not found in token" }, { status: 401 });
    }

    return NextResponse.json({ 
        success: true, 
        user: {
            id: user.id || user._id,
            name: user.name,
            email: user.gmail || user.email, // Map gmail to email
            mobile: user.mobile
        } 
    });

  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
