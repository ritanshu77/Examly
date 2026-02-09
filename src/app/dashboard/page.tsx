import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {} as Record<string, string>;
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const idx = c.indexOf("=");
      if (idx === -1) return [c.trim(), ""];
      const name = c.slice(0, idx).trim();
      const val = c.slice(idx + 1).trim();
      return [name, decodeURIComponent(val)];
    })
  ) as Record<string, string>;
}

export default async function DashboardPage() {
  console.log("----DashboardPage START----");
  const cookieStore = await cookies();
  let token: string | undefined;

  if (typeof (cookieStore as any).get === "function") {
    token = (cookieStore as any).get("token")?.value;
  } else {
    let cookieHeader: string | null = null;
    try {
      const h = (headers as any)();
      if (h && typeof h.get === "function") {
        cookieHeader = h.get("cookie");
      }
    } catch (e) {
      cookieHeader = null;
    }
    const parsed = parseCookies(cookieHeader);
    token = parsed["token"];
  }
  
  console.log("----dashboard token--11----", token ? "FOUND" : "MISSING");
  if (!token) {
    console.log("Redirecting to login (no token)");
    redirect("/login");
  }
  
  let user: any = null;
  
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    console.log("Fetching from:", backend);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout

    const res = await fetch(`${backend}/auth/validate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      // If server error (5xx) or sleeping, allow access
      if (res.status >= 500) {
        console.log("Backend sleeping/error (5xx), rendering shell anyway");
        return <DashboardShell user={{ name: { en: "Guest (Server Sleeping)" } }} />;
      }
      console.log("----dashboard token--33---- Redirecting to login (4xx)");
      redirect("/login");
    }

    const data = await res.json();
    
    if (!data || !data?.user) {
      console.log("----dashboard token--44---- Redirecting (no user data)");
      redirect("/login");
    }

    user = data.user;
    console.log("User validated:", user?.name?.en);
    
    // ✅ FIXED: React Fragment added
    return (
      <>
        <DashboardShell user={user} />
      </>
    );
    
  } catch (err) {
    console.log("----55---error--dashboard token----", err);
    // If fetch failed (e.g. timeout), assume server sleeping and allow access
    return <DashboardShell user={{ name: { en: "Guest (Timeout/Error)" } }} />;
  }
}
