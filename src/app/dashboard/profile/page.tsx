"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/components/Toast";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/auth/me");
      if (data.success && data.user) {
        setUserId(data.user.id || data.user._id);
        setFormData({
          name: typeof data.user.name === 'string' ? data.user.name : (data.user.name?.en || ""),
          email: data.user.email || data.user.gmail || "",
          mobile: data.user.mobile || ""
        });
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const name = formData.name.trim();
    const mobile = formData.mobile.trim();

    if (!name) {
      toast("Name is required", "error");
      return;
    }
    if (name.length < 3 || name.length > 50) {
        toast("Name must be between 3 and 50 characters", "error");
        return;
    }
    if (!/^[a-zA-Z\s\.]+$/.test(name)) {
        toast("Name can only contain letters, spaces, and dots", "error");
        return;
    }

    if (!formData.email.trim() && !mobile) {
      toast("Either Email or Mobile number is required", "error");
      return;
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
        toast("Mobile number must be exactly 10 digits", "error");
        return;
    }

    try {
      setSaving(true);
      const payload = {
        userId,
        name: name,
        gmail: formData.email.trim(),
        mobile: mobile
      };

      const { data } = await axios.post("/api/auth/profile", payload);
      
      if (data.success) {
        toast("Profile updated successfully", "success");
        // Optionally refresh page or update context
        router.refresh();
      } else {
        toast(data.message || "Failed to update", "error");
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <style jsx>{`
        .profile-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-top: 4px solid var(--primary-blue);
        }
        .form-group {
          margin-bottom: 20px;
        }
        .label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 15px;
          transition: all 0.2s;
        }
        .input:focus {
          border-color: var(--primary-blue);
          outline: none;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }
        .save-btn {
          background: var(--primary-blue);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
        }
        .save-btn:hover {
          background: #1976d2;
        }
        .save-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        h1 {
            color: var(--primary-blue);
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: bold;
        }
      `}</style>

      <h1>My Profile</h1>
      
      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Full Name *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Email Address</label>
            {/* <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Either Email or Mobile is required</div> */}
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="label">Mobile Number</label>
            <input
              type="tel"
              className="input"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="Enter your mobile number"
            />
          </div>

          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
