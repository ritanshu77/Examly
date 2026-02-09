import { NextResponse } from "next/server";

// Store state outside to persist across requests (in memory)
let lastCheckTime = 0;
let lastStatus = 503; // Default to 'SLEEPING'
const CHECK_INTERVAL = 2000; // 2 seconds

export async function GET() {
  const now = Date.now();
  
  // If we checked recently, return cached status
  if (now - lastCheckTime < CHECK_INTERVAL) {
    return NextResponse.json(
      { status: lastStatus === 200 ? 'OK' : 'SLEEPING' }, 
      { status: lastStatus }
    );
  }

  try {
    // Ensure this matches your live backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"; 
    
    // Set a timeout to detect if server is sleeping
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(`${backendUrl}/health`, { 
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Backend not ready');
    
    // Update cache - Success
    lastCheckTime = now;
    lastStatus = 200;
    return NextResponse.json({ status: 'OK' });

  } catch (error) {
    // Update cache - Failed
    lastCheckTime = now;
    lastStatus = 503;
    return NextResponse.json({ status: 'SLEEPING' }, { status: 503 });
  }
}