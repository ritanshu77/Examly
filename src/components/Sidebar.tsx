"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "./Toast";

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  const closeSidebar = () => {
    if (onClose) onClose();
    if (window.innerWidth <= 768) {
      document.getElementById("sidebar")?.classList.remove("active");
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'active' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">Quiz App</div>
        <button className="sidebar-close-btn" onClick={closeSidebar}>&times;</button>
      </div>
      
      <div className="sidebar-content">
        <Link 
          href="/dashboard" 
          className={`nav-link ${pathname === '/dashboard' || (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/profile')) ? 'active' : ''}`} 
          onClick={closeSidebar}
        >
          🏠 Dashboard
        </Link>
        {/* <a
          href="#"
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            toast("Work in progress", "info");
            closeSidebar();
          }}
        >
          📝 My Tests
        </a>
        <a
          href="#"
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            toast("Work in progress", "info");
            closeSidebar();
          }}
        >
          📊 Performance
        </a>
        <a
          href="#"
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            toast("Work in progress", "info");
            closeSidebar();
          }}
        >
          🏆 Leaderboard
        </a> */}
        <Link 
          href="/dashboard/profile" 
          className={`nav-link ${pathname.startsWith('/dashboard/profile') ? 'active' : ''}`} 
          onClick={closeSidebar}
        >
          👤 Profile
        </Link>
        {/* <a
          href="#"
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            toast("Work in progress", "info");
            closeSidebar();
          }}
        >
          ⚙️ Settings
        </a> */}
        
        <div style={{ flex: 1 }}></div>

        <a
          href="#"
          className="nav-link"
          style={{ color: "var(--error-red)", borderTop: "1px solid #eee", paddingTop: 15 }}
          onClick={(e) => {
            e.preventDefault();
            closeSidebar();
            try {
              try {
                document.cookie = "id=; Max-Age=0; path=/; SameSite=Lax";
                document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax";
              } catch {}
              fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
              toast("Logged out", "success");
            } finally {
              window.location.href = "/login";
            }
          }}
        >
          🚪 Logout
        </a>
      </div>
    </div>
  );
}
