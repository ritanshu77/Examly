import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET() {
  try {
    // server-side cookies available via Request? NextResponse doesn't expose them here.
    // Instead, the client can call this route which will use request cookies automatically in perimeter.
    return NextResponse.json({ success: false, message: "Use POST with token or call from server" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body?.token;

    if (!token) return NextResponse.json({ success: false, message: "token required" }, { status: 400 });

    const res = await fetch(`${BACKEND}/auth/validate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
