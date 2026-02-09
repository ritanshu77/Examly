import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const BACKEND = process.env.BACKEND_URL || "http://localhost:3001";
  const body = await req.json();

  try {
    const res = await fetch(`${BACKEND}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    const token = data?.data?.token;
    const userId = data?.data?.user?.id;

    const response = NextResponse.json(data);

    if (token) {
      response.cookies.set("token", token, {
        httpOnly: false,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 600 * 60 * 60,
        expires: new Date(Date.now() + 600 * 60 * 60 * 1000),
      });
    }

    if (userId) {
      response.cookies.set("id", String(userId), {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 600 * 60 * 60,
        expires: new Date(Date.now() + 600 * 60 * 60 * 1000),
      });
    }

    return response;
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
