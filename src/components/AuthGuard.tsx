"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Allow public routes
    if (pathname === "/login" || pathname === "/register") {
      setIsChecking(false);
      return;
    }

    // Check for auth token
    const hasToken = document.cookie.split(';').some((item) => item.trim().startsWith('token='));
    
    if (!hasToken) {
      router.replace("/login");
    }
    
    setIsChecking(false);
  }, [pathname, router]);

  // While checking, render nothing or a loader to prevent flash
  // However, for public routes, we want to render immediately (handled by initial state logic if we want, but simpler to just wait)
  // To avoid flicker on public routes, we can check condition immediately? No, use effect runs after mount.
  // But we can check cookie in state initialization if we wanted, but that causes hydration mismatch.
  
  // If we are on a protected route and checking, show nothing.
  if (isChecking && pathname !== "/login" && pathname !== "/register") {
      return null;
  }

  return <>{children}</>;
}
