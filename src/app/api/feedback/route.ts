import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    
    const authHeader = request.headers.get("authorization");

    const res = await fetch(`${backend}/feedback`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": authHeader || ""
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const authHeader = request.headers.get("authorization");

    const res = await fetch(`${backend}/feedback`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": authHeader || ""
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
