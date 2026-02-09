import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    
    const authHeader = request.headers.get("authorization");

    const res = await fetch(`${backend}/attempts/progress`, {
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
    console.error("Error saving progress:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const questionSetId = searchParams.get("questionSetId");
        
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        const authHeader = request.headers.get("authorization");

        const res = await fetch(`${backend}/attempts/progress?userId=${userId}&questionSetId=${questionSetId}`, {
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
        console.error("Error fetching progress:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
