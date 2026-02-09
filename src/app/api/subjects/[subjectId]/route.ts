import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;
  const backend = process.env.BACKEND_URL || "http://localhost:3001";
  const url = `${backend}/questions/subjects/${subjectId}`;

  try {
    const cookieHeader = request.headers.get("cookie");
    const authHeader = request.headers.get("authorization");
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader || "",
        "Authorization": authHeader || "",
      },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
