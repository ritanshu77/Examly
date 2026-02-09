"use client";
import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info" | "confirm";

interface ToastItem {
  id: number;
  msg: string;
  type: ToastType;
  onConfirm?: () => void;
}

let enqueueToast: ((msg: string, type?: ToastType, onConfirm?: () => void) => void) | null = null;

export function toast(msg: string, type: ToastType = "info") {
  if (enqueueToast) enqueueToast(msg, type);
}

export function confirmToast(msg: string, onConfirm: () => void) {
  if (enqueueToast) enqueueToast(msg, "confirm", onConfirm);
}

export default function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    enqueueToast = (msg: string, type: ToastType = "info", onConfirm?: () => void) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, msg, type, onConfirm }]);
      
      // Only auto-dismiss if NOT confirm type
      if (type !== "confirm") {
        setTimeout(() => {
          setItems((prev) => prev.filter((i) => i.id !== id));
        }, 3000);
      }
    };
    return () => { enqueueToast = null; };
  }, []);

  const removeToast = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div style={{ position: "fixed", top: 12, right: 12, zIndex: 2000, display: "flex", flexDirection: "column", gap: 8 }}>
      <style>{`
        .toast {
          min-width: 220px;
          max-width: 360px;
          padding: 10px 12px;
          border-radius: 8px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
          color: #fff;
          font-size: 14px;
        }
        .toast.info { background: #3b82f6; }
        .toast.success { background: #22c55e; }
        .toast.error { background: #ef4444; }
        .toast.confirm { background: #f59e0b; color: #fff; }
        
        .toast-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          justify-content: flex-end;
        }
        .toast-btn {
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          transition: opacity 0.2s;
        }
        .toast-btn:hover { opacity: 0.9; }
        .toast-btn.yes { background: #fff; color: #f59e0b; }
        .toast-btn.no { background: rgba(0,0,0,0.15); color: #fff; }
      `}</style>
      {items.map((i) => (
        <div key={i.id} className={`toast ${i.type}`}>
          <div>{i.msg}</div>
          {i.type === "confirm" && (
            <div className="toast-actions">
              <button className="toast-btn no" onClick={() => removeToast(i.id)}>No</button>
              <button className="toast-btn yes" onClick={() => {
                if (i.onConfirm) i.onConfirm();
                removeToast(i.id);
              }}>Yes</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
