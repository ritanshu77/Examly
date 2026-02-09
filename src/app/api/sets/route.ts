import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const backend = process.env.BACKEND_URL || "http://localhost:3001";
  const url = `${backend}/questions/sets`;

  try {
    const cookieHeader = request.headers.get("cookie");
    const authHeader = request.headers.get("authorization");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader || "",
        "Authorization": authHeader || "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching sets:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
