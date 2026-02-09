import LoginForm from "../../components/LoginForm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function LoginPage() {
  const cookieStore = await cookies();
  let token: string | undefined;
  let id: string | undefined;
  try {
    token = (cookieStore as any).get?.("token")?.value;
    id = (cookieStore as any).get?.("id")?.value;
  } catch {
    token = undefined;
    id = undefined;
  }
  
  if (!token || !id) {
    try {
      const h = await headers();
      const cookieHeader = h.get("cookie") || "";
      const parts = cookieHeader.split(";").map(s => s.trim());
      for (const p of parts) {
        const idx = p.indexOf("=");
        if (idx > -1) {
          const name = p.slice(0, idx);
          const val = decodeURIComponent(p.slice(idx + 1));
          if (name === "token") token = val;
          if (name === "id") id = val;
        }
      }
    } catch {}
  }
  
  if (token) {
    let shouldRedirect = false;
    try {
      const backend = process.env.BACKEND_URL || "http://localhost:3001";
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      const res = await fetch(`${backend}/auth/validate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const user = data?.data?.user ?? data?.user ?? data?.data?.data?.user;
        const success = data?.success ?? Boolean(user);
        const userId = user?.id ?? user?.userId ?? user?.uid;
        const matchesId = id ? String(userId) === String(id) : true;
        shouldRedirect = Boolean(success && user && matchesId);
      }
    } catch (err) {
      console.log("Token invalid:", err);
    }
    if (shouldRedirect) {
      redirect("/dashboard");
    }
  }

  return <LoginForm />;
}
// console.log("----------13------------------");
// async function parseCookies(cookieHeader: string | null) {
//   if (!cookieHeader) return {} as Record<string, string>;
//   return Object.fromEntries(
//     cookieHeader.split(";").map((c) => {
//       const idx = c.indexOf("=");
//       if (idx === -1) return [c.trim(), ""];
//       const name = c.slice(0, idx).trim();
//       const val = c.slice(idx + 1).trim();
//       return [name, decodeURIComponent(val)];
//     })
//   ) as Record<string, string>;
// }


// console.log("----------12------------------");
// export default async function LoginPage() {
//   const cookieStore = await cookies();
//   let token: string | undefined;

//   if (typeof (cookieStore as any).get === "function") {
//     token = (cookieStore as any).get("token")?.value;
//   } else {
//     let cookieHeader: string | null = null;
//     try {
//       // headers() could be used as fallback if needed
//       cookieHeader = null;
//     } catch (e) {
//       cookieHeader = null;
//     }
//     const parsed = await parseCookies(cookieHeader);
//     token = parsed["token"];
//   }
// console.log("----------77------------------");
//   if (token) {
//     try {
//       const res = await fetch(`${process.env.BACKEND_URL }/auth/validate-token`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token }),
//         cache: "no-store",
//       });

//       if (res.ok) {
//         const data = await res.json();
//         if (data?.success && data?.data?.user) {
//           redirect("/dashboard");
//         }
//       }
//     } catch (err) {
//       // ignore and render login form
//     }
//   }
// console.log("----------88------------------");
//   return <LoginForm />;
// }
