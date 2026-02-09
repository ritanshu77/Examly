import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const body = await req.json();
  const token = req.cookies.get("token")?.value;

  if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${backend}/auth/session-time`, {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
        return NextResponse.json({ success: false }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
