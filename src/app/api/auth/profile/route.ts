import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "No token found" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, gmail, mobile } = body;

    // Support both email and gmail keys
    const emailToUse = email !== undefined ? email : gmail;

    if (!name || (emailToUse === undefined && mobile === undefined)) {
        return NextResponse.json({ success: false, message: "Name, and either Email or Mobile are required" }, { status: 400 });
    }

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"; // Fallback if env missing
    
    // 1. Validate token to get userId
    const validateRes = await fetch(`${backend}/auth/validate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    if (!validateRes.ok) {
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const validateData = await validateRes.json();
    const user = validateData?.data?.user ?? validateData?.user;
    
    if (!user || (!user.id && !user._id)) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    const userId = user.id || user._id;

    // 2. Update Profile
    const updateRes = await fetch(`${backend}/auth/profile`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            userId,
            name,
            gmail: emailToUse, // Backend uses gmail
            mobile
        }),
        cache: "no-store",
    });

    const updateData = await updateRes.json();

    if (!updateRes.ok || !updateData.success) {
        return NextResponse.json({ 
            success: false, 
            message: updateData.message || "Failed to update profile" 
        }, { status: updateRes.status || 400 });
    }

    return NextResponse.json({ 
        success: true, 
        message: "Profile updated successfully",
        user: updateData.user 
    });

  } catch (error) {
    console.error("Auth profile update error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
