"use server";
import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/dashboard");
}
// console.log("----------11------------------");
// function parseCookies(cookieHeader: string | null) {
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
// console.log("----------222-----------------");
// export default async function Home() {
//   const cookieStore = await cookies();
//   let token: string | undefined;

//   if (typeof (cookieStore as any).get === "function") {
//     token = (cookieStore as any).get("token")?.value;
//     console.log("---token-------11----",token)
//   } else {
//     let cookieHeader: string | null = null;
//     try {
//       const h = (headers as any)();
//       if (h && typeof h.get === "function") {
//         cookieHeader = h.get("cookie");
//       }
//     } catch (e) {
//       cookieHeader = null;
//     }
//     const parsed = parseCookies(cookieHeader);
//     token = parsed["token"];
//   }
// console.log("----------33-----------------");
//   if (token) {
//     try {
//       const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://192.168.1.6:3001";
//       const res = await fetch(`${backend}/auth/validate-token`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token }),
//         cache: "no-store",
//       });
//       console.log("------res----validate-token----",res)
//       if (res.ok) {
//         const data = await res.json();
//         if (data?.success) {
//           redirect("/dashboard");
//         }
//       }
//     } catch (err) {
//       // validation failed — fall through to login
//       console.log("Token validation error:--22--", err);
//     }
//   }
// console.log("----------44------------------");
//   redirect("/login");
// }
