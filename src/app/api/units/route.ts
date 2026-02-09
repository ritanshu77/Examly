import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const backend = process.env.BACKEND_URL || "http://localhost:3001";
    const url = `${backend}/questions/subjects/units`;
      
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
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(errorData, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Units API error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

