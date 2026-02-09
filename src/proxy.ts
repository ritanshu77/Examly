import { NextRequest, NextResponse } from "next/server";

async function isValid(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const id = req.cookies.get("id")?.value;
  console.log("---token--", token ? "EXISTS" : "MISSING");
  console.log("---id--", id ? "EXISTS" : "MISSING");
  
  if (!token) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const res = await fetch(`${backend}/auth/validate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) {
        // If 500/503 (Server Error/Sleeping), allow access so client can show "Server Starting"
        if (res.status >= 500) return true;
        return false;
      }
      
      const data = await res.json();
      const user = data?.data?.user ?? data?.user ?? data?.data?.data?.user;
      const success = data?.success ?? Boolean(user);
      const userId = user?.id ?? user?.userId ?? user?.uid;
      const matchesId = id ? String(userId) === String(id) : true;
      
      return Boolean(success && user && matchesId);
    } catch (err) {
      clearTimeout(timeoutId);
      console.log("Middleware validation error (allowing access):", err);
      // If backend is unreachable/timeout, allow access so UI can handle it
      return true;
    }
  } catch (outerErr) {
    console.log("Middleware critical error:", outerErr);
    return true;
  }
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  console.log(`Middleware checking: ${pathname}`);
  
  if (pathname.startsWith("/api")) return NextResponse.next();
  
  const valid = await isValid(req);
  console.log(`-------Path: ${pathname}, Valid: ${valid}`);

  if (pathname === "/login") {
    if (valid) {
      const url = new URL("/dashboard", req.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  
  if (!valid) {
    console.log(`Redirecting to login from ${pathname}`);
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
