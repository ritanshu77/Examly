import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const body = await request.json();
  
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const url = `${backend}/questions/unit/allsets/${unitId}`;

  try {
      const cookieHeader = request.headers.get("cookie");
      const authHeader = request.headers.get("authorization");
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader || '',
          'Authorization': authHeader || '',
        },
        body: JSON.stringify(body),
        cache: 'no-store'
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
  } catch (error) {
      console.error("Error fetching unit sets:", error);
      return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
