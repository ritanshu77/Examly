"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getAuthToken } from "@/utils/auth";

export default function Navbar({ onToggle }: { onToggle?: () => void }) {
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const { data } = await axios.get('/api/auth/me', {
          withCredentials: true,
          headers
        });

        if (data?.user?.name) {
          const nameVal = data.user.name;
          if (typeof nameVal === 'string') {
             setUserName(nameVal);
          } else if (typeof nameVal === 'object') {
             setUserName(nameVal.en || nameVal.hi || "User");
          }
        }
      } catch (err) {
        // Silent fail for navbar, keep as Guest
        console.error("Navbar fetch user error", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <nav className="top-nav">
      <div style={{ fontWeight: 700, color: 'var(--primary-blue)', fontSize: 18 }}>Quiz App</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>Hello, <b>{userName}</b></span>
        <button className="toggle-btn" onClick={() => { if (onToggle) onToggle(); else { const s = document.getElementById('sidebar'); if (s) s.classList.toggle('active'); } }}>☰</button>
      </div>
    </nav>
  );
}
