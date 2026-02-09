 "use client";
import { useState } from "react";
import TimeTracker from "../../components/TimeTracker";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { usePathname } from "next/navigation";

// metadata removed to allow client layout

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: any;  // User type add karo
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const hideChrome = /^\/dashboard\/units\/[^/]+\/sets\/[^/]+$/.test(pathname || "");
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <TimeTracker />
      {hideChrome ? (
        <main className="main-content" style={{ minHeight: "100vh" }}>
          {children}
        </main>
      ) : (
        <div>
          <Navbar onToggle={toggleSidebar} />
          <div className="wrapper">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
                onClick={closeSidebar}
            />
            <main className="main-content">{children}</main>
          </div>
        </div>
      )}
    </>
  );
}
