"use client";

import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/utils/auth";

interface Unit {
  unitId: string;
  name: { en: string; hi: string };  // ✅ Object type
  totalQuestions: number;
  easy?: number;
  medium?: number;
  hard?: number;
  description?: { en: string; hi: string };
  chapterCount?: number;
}

interface UnitsViewProps {
  subjectId: string;
  subjectName: string;
  subjectNameHi: string;
  onBack: () => void;
  titleId?: string;
}

export default function UnitsView({ 
  subjectId, 
  subjectName, 
  subjectNameHi,
  onBack,
  titleId
}: UnitsViewProps) {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const didFetchUnitsRef = useRef(false);
  useEffect(() => {
    if (didFetchUnitsRef.current) return;
    didFetchUnitsRef.current = true;
    fetchUnits();
  }, [subjectId]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post(
        `/api/units`,
        {
          subjectId,
          titleId,
          quizType: titleId ? 'title-chapter' : 'chapter' // Pass quizType explicitly
        },
        { 
            withCredentials: true,
            headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        }
      );
      setUnits(data.units || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load units';
      console.error('Units fetch error:', error);
      setError(errorMsg);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <style jsx>{`
        .header h1 { font-size: 24px; font-weight: bold; color: var(--primary-blue); margin: 0 0 4px 0; }
        .units-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; }
        .unit-card { 
          background: white; padding: 4px 10px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); 
          border-left: 4px solid #10b981; cursor: pointer; transition: all 0.3s;
        }
        .unit-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .empty-state { text-align: center; padding: 40px 20px; color: #666; }
        .loading { text-align: center; padding: 40px 20px; color: #666; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div className="header">
            <h1>Units - {subjectName}</h1>
            <p style={{ color: "#666", fontSize: 13, margin: "0" }}>
            {loading ? "Loading..." : `${units.length} units available`}
            </p>
        </div>
        <button onClick={onBack} className="back-btn">
            ← Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div style={{ fontSize: 16 }}>Loading units...</div>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ color: '#dc2626', borderTop: '2px solid #dc2626', paddingTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>
            Error Loading Units
          </h2>
          <p style={{ fontSize: 16, marginBottom: 20 }}>
            {error}
          </p>
          <button 
            onClick={fetchUnits}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Retry
          </button>
        </div>
      ) : units.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 20 }}>📭</div>
          <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>
            No Units Available
          </h2>
          <p style={{ fontSize: 16 }}>
            Is subject mein abhi koi units nahi hain.
          </p>
        </div>
      ) : (
        <div className="units-grid">
          {units.map((unit) => (
            <div 
              key={unit.unitId} 
              className="unit-card"
              onClick={() => {
                const url = titleId 
                  ? `/dashboard/units/${unit.unitId}/sets?titleId=${titleId}`
                  : `/dashboard/units/${unit.unitId}/sets`;
                router.push(url);
              }}
            >
              {/* ✅ FIXED: Object name handling */}
              <h3 style={{ 
                fontSize: 14, 
                fontWeight: "600", 
                marginBottom: 0,
                color: "var(--primary-blue)"
              }}>
                {unit.name?.en || unit.name?.hi || 'Unit'}
              </h3>
              
              <p style={{ 
                fontSize: 18, 
                color: "#1f2937", 
                fontWeight: "bold", 
                margin: "0 0 0px 0" 
              }}>
                {unit.totalQuestions.toLocaleString()} <span style={{fontSize: 14, fontWeight: 'normal', color: '#666'}}>Questions</span>
              </p>
              
              {/* ✅ Difficulty breakdown */}
              {unit.easy !== undefined && (
                <p style={{ fontSize: 12, color: "#10b981", marginBottom: 2 }}>
                  {unit.easy} Easy • {unit.medium} Medium • {unit.hard} Hard
                </p>
              )}
              
              {unit.chapterCount && (
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                  {unit.chapterCount} Chapters
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
