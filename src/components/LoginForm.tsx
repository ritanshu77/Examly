"use client";

import { useEffect, useState } from "react";
import { toast } from "./Toast";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default function LoginForm() {
  // Tabs: 'guest' | 'user'
  const [activeTab, setActiveTab] = useState<'guest' | 'user'>('guest');
  
  // Guest State
  const [guestName, setGuestName] = useState("");
  const [guestError, setGuestError] = useState<string | null>(null);
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  // User State
  const [isRegistering, setIsRegistering] = useState(false);
  const [userName, setUserName] = useState("");
  const [userIdentifier, setUserIdentifier] = useState(""); // Email or Mobile (for Login)
  
  // Separate fields for Registration
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerMobile, setRegisterMobile] = useState("");

  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState<string>("");

  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const { visitorId } = await fp.get();
        setVisitorId(visitorId);
        if (typeof window !== 'undefined') {
            localStorage.setItem('deviceId', visitorId);
        }
      } catch (error) {
        console.error("Fingerprint error:", error);
        const fallbackId = `fallback_${Math.random().toString(36).slice(2)}`;
        setVisitorId(fallbackId);
      }
    };
    initFingerprint();
  }, []);

  // Validation for Guest Name
  useEffect(() => {
    const val = guestName.trim();
    if (val.length === 0) { setGuestError(null); return; }
    if (val.length < 3) { setGuestError("Name must be at least 3 characters"); return; }
    if (val.length > 15) { setGuestError("Name must be at most 15 characters"); return; }
    if (!/^[A-Za-z ]+$/.test(val)) { setGuestError("Use letters and spaces only"); return; }
    setGuestError(null);
  }, [guestName]);

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || guestError) return;
    setShowGuestWarning(true);
  };

  const confirmGuestLogin = async () => {
    setShowGuestWarning(false);
    setLoading(true);

    try {
      const payload = {
        name: guestName.trim(),
        deviceId: visitorId || `unknown_${Date.now()}`,
        browserId: visitorId || "web",
        systemInfo: navigator.platform || "",
        userAgent: navigator.userAgent,
      };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        window.location.href = "/dashboard";
      } else {
        toast(data?.message || data?.error || "Guest login failed", "error");
      }
    } catch (err) {
      toast("Login error: " + String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUserError(null);

    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login-user";
      
      const payload: any = {
        deviceId: visitorId || `unknown_${Date.now()}`,
      };

      if (isRegistering) {
        // Validation
        if (userName.length < 3 || userName.length > 50) {
            toast("Name must be between 3 and 50 characters", "error");
            setLoading(false); return;
        }
        if (!/^[a-zA-Z\s\.]+$/.test(userName)) {
            toast("Name can only contain letters, spaces, and dots", "error");
            setLoading(false); return;
        }

        payload.name = userName;
        payload.password = userPassword;
        
        const email = registerEmail.trim();
        const mobile = registerMobile.trim();

        if (!email && !mobile) {
            toast("Either Email or Mobile is required", "error");
            setLoading(false);
            return;
        }

        if (mobile && !/^\d{10}$/.test(mobile)) {
            toast("Mobile number must be exactly 10 digits", "error");
            setLoading(false); return;
        }

        if (email) payload.email = email;
        if (mobile) payload.mobile = mobile;

      } else {
        payload.identifier = userIdentifier;
        payload.password = userPassword;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        window.location.href = "/dashboard";
      } else {
        const msg = data?.message || data?.error || "Action failed";
        toast(msg, "error");
        setUserError(msg);
      }
    } catch (err) {
        const msg = "Error: " + String(err);
        toast(msg, "error");
        setUserError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        :root {
          --primary-blue: #008ecc;
          --warning-orange: #ff9800;
          --bg-gradient: linear-gradient(135deg, #a1a39a 0%, #6aa24b 100%);
        }
        * { box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-gradient);
          padding: 20px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 32px 24px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          width: 100%;
          max-width: 420px;
          text-align: center;
          position: relative;
        }

        .tabs {
            display: flex;
            margin-bottom: 24px;
            background: #f1f5f9;
            padding: 4px;
            border-radius: 8px;
        }
        .tab-btn {
            flex: 1;
            padding: 8px;
            border: none;
            background: transparent;
            cursor: pointer;
            border-radius: 6px;
            font-weight: 600;
            color: #64748b;
            transition: all 0.2s;
        }
        .tab-btn.active {
            background: white;
            color: var(--primary-blue);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .form-group { margin-bottom: 16px; text-align: left; }
        .label { display: block; margin-bottom: 6px; font-size: 14px; color: #374151; font-weight: 500; }
        .input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        .input:focus {
          border-color: var(--primary-blue);
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 142, 204, 0.1);
        }

        .btn {
          width: 100%;
          padding: 12px;
          background: var(--primary-blue);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn:hover { background: #0077aa; }
        .btn:disabled { background: #9ca3af; cursor: not-allowed; }

        .toggle-text {
            margin-top: 16px;
            font-size: 14px;
            color: #666;
        }
        .link {
            color: var(--primary-blue);
            cursor: pointer;
            font-weight: 600;
            margin-left: 4px;
        }
        .link:hover { text-decoration: underline; }

        .error-msg {
            color: #ef4444;
            font-size: 13px;
            margin-top: 4px;
        }

        /* Modal */
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center;
            z-index: 1000;
        }
        .modal {
            background: white;
            padding: 24px;
            border-radius: 12px;
            width: 90%;
            max-width: 320px;
            text-align: center;
            animation: popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        }
        @keyframes popIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .modal-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #1f2937; }
        .modal-desc { font-size: 14px; color: #6b7280; margin-bottom: 20px; line-height: 1.5; }
        .modal-actions { display: flex; gap: 10px; }
        .modal-btn { flex: 1; padding: 10px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; }
        .btn-cancel { background: #e5e7eb; color: #374151; }
        .btn-confirm { background: var(--primary-blue); color: white; }

      `}</style>

      <div className="login-card">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>
           Welcome Back
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
           Select your login method
        </p>

        <div className="tabs">
            <button 
                className={`tab-btn ${activeTab === 'guest' ? 'active' : ''}`}
                onClick={() => setActiveTab('guest')}
            >
                Guest
            </button>
            <button 
                className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveTab('user')}
            >
                Permanent User
            </button>
        </div>

        {activeTab === 'guest' ? (
            <form onSubmit={handleGuestSubmit}>
                <div className="form-group">
                    <label className="label">Display Name</label>
                    <input 
                        className="input"
                        placeholder="Enter your name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                    />
                    {guestError && <div className="error-msg">{guestError}</div>}
                </div>
                
                <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #ffedd5' }}>
                    <p style={{ fontSize: '12px', color: '#c2410c', margin: 0 }}>
                        ⚠️ Guest accounts are temporary.
                    </p>
                </div>

                <button className="btn" disabled={loading || !!guestError || !guestName.trim()}>
                    {loading ? "Processing..." : "Continue as Guest"}
                </button>
            </form>
        ) : (
            <form onSubmit={handleUserSubmit}>
                {isRegistering && (
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <input 
                            className="input"
                            placeholder="Your Name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                )}

                {isRegistering ? (
                    <>
                        <div className="form-group">
                            <label className="label">Email Address</label>
                            <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>At least one contact method required</div>
                            <input 
                                className="input"
                                type="email"
                                placeholder="user@example.com"
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Mobile Number</label>
                            <input 
                                className="input"
                                type="tel"
                                placeholder="9876543210"
                                value={registerMobile}
                                onChange={(e) => setRegisterMobile(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="form-group">
                        <label className="label">Mobile or Email</label>
                        <input 
                            className="input"
                            placeholder="e.g., 9876543210 or user@example.com"
                            value={userIdentifier}
                            onChange={(e) => setUserIdentifier(e.target.value)}
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label className="label">Password</label>
                    <div style={{ position: 'relative' }}>
                        <input 
                            className="input"
                            type={showPassword ? "text" : "password"}
                            placeholder="******"
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            required
                            style={{ paddingRight: '40px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#666',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px'
                            }}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {userError && <div className="error-msg" style={{ marginBottom: 10 }}>{userError}</div>}

                <button className="btn" disabled={loading}>
                    {loading ? "Processing..." : (isRegistering ? "Register" : "Login")}
                </button>

                <div className="toggle-text">
                    {isRegistering ? "Already have an account?" : "Don't have an account?"}
                    <span className="link" onClick={() => {
                        setIsRegistering(!isRegistering);
                        setUserError(null);
                    }}>
                        {isRegistering ? "Login" : "Register"}
                    </span>
                </div>
            </form>
        )}
      </div>

      {/* Guest Warning Modal */}
      {showGuestWarning && (
        <div className="modal-overlay" onClick={() => setShowGuestWarning(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
                <div className="modal-title">Temporary Account Warning</div>
                <div className="modal-desc">
                    If you login as a Guest, your progress will be saved only on this browser. 
                    <b> If you clear data or logout, your account will be lost forever.</b>
                    <br/><br/>
                    Do you want to continue?
                </div>
                <div className="modal-actions">
                    <button className="modal-btn btn-cancel" onClick={() => setShowGuestWarning(false)}>
                        Go Back
                    </button>
                    <button className="modal-btn btn-confirm" onClick={confirmGuestLogin}>
                        Yes, Continue
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
